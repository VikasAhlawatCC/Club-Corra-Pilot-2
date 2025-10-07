import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { CoinTransaction } from '../entities/coin-transaction.entity'
import { Brand } from '../../brands/entities/brand.entity'
import { User } from '../../users/entities/user.entity'
import { CoinBalance } from '../entities/coin-balance.entity'
import { CreateRewardRequestDto } from '../dto/create-reward-request.dto'

@Injectable()
export class TransactionValidationService {
  constructor(
    @InjectRepository(CoinTransaction)
    private readonly transactionRepository: Repository<CoinTransaction>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CoinBalance)
    private readonly balanceRepository: Repository<CoinBalance>,
  ) {}

  async validateRewardRequest(userId: string, createRewardRequestDto: CreateRewardRequestDto): Promise<void> {
    const { brandId, billAmount, billDate, coinsToRedeem = 0, upiId } = createRewardRequestDto

    // 1. Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // 2. Validate brand exists and is active
    const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } })
    if (!brand) {
      throw new NotFoundException('Brand not found or inactive')
    }

    // 3. Validate bill amount (whole numbers only)
    if (!Number.isInteger(billAmount) || billAmount < 1 || billAmount > 100000) {
      throw new BadRequestException('Bill amount must be a whole number between 1 and 100,000')
    }

    // 4. Validate bill date (not future, not too old - max 30 days)
    const billDateObj = new Date(billDate)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (billDateObj > now) {
      throw new BadRequestException('Bill date cannot be in the future')
    }

    if (billDateObj < thirtyDaysAgo) {
      throw new BadRequestException('Bill date cannot be older than 30 days')
    }

    // 5. Check for duplicate submissions (same user, brand, bill amount, and date)
    await this.validateNoDuplicateTransaction(userId, brandId, billAmount, billDateObj)

    // 6. Get current balance for validation
    const currentBalance = await this.getUserBalance(userId)

    // 7. Validate redemption amount and limits
    if (coinsToRedeem > 0) {
      // Check sufficient balance for redemption
      await this.validateSufficientBalance(userId, coinsToRedeem)

      // Check brand redemption limits
      await this.validateBrandRedemptionLimits(brandId, billAmount, coinsToRedeem)

      // Validate UPI ID format
      this.validateUpiId(upiId || '')
    }

    // 8. Calculate expected earning and validate
    const netBillAmount = billAmount - coinsToRedeem
    const coinsEarned = Math.max(1, Math.round((netBillAmount * brand.earningPercentage) / 100))
    
    // Check brand earning limits
    await this.validateBrandEarningLimits(brandId, coinsEarned)

    // 9. Validate that final balance won't be negative
    await this.validateNoNegativeBalance(userId, coinsEarned, coinsToRedeem)

    // 10. Additional validation: Ensure net bill amount is positive after redemption
    if (netBillAmount <= 0) {
      throw new BadRequestException('Redemption amount cannot exceed bill amount')
    }
  }

  async validateEarnRequest(userId: string, brandId: string, billAmount: number): Promise<void> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Validate brand exists and is active
    const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } })
    if (!brand) {
      throw new NotFoundException('Brand not found or inactive')
    }

    // Validate bill amount
    if (billAmount < 0.01 || billAmount > 100000) {
      throw new BadRequestException('Bill amount must be between $0.01 and $100,000')
    }

    // Check brand earning caps
    if (brand.maxEarningPerTransaction) {
      const potentialEarning = Math.round((billAmount * brand.earningPercentage) / 100)
      if (potentialEarning > brand.maxEarningPerTransaction) {
        throw new BadRequestException(`Maximum earning amount for this brand is ${brand.maxEarningPerTransaction} coins`)
      }
    }
  }

  async validateRedeemRequest(userId: string, brandId: string, coinsToRedeem: number): Promise<void> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Validate brand exists and is active
    const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } })
    if (!brand) {
      throw new NotFoundException('Brand not found or inactive')
    }

    // Validate redemption amount
    if (coinsToRedeem <= 0) {
      throw new BadRequestException('Redemption amount must be greater than 0')
    }

    const balance = await this.getUserBalance(userId)
    if (BigInt(balance.balance) < BigInt(coinsToRedeem)) {
      throw new BadRequestException('Insufficient coin balance for redemption')
    }

    // Check brand redemption limits
    if (brand.maxRedemptionPerTransaction && coinsToRedeem > brand.maxRedemptionPerTransaction) {
      throw new BadRequestException(`Maximum redemption amount for this brand is ${brand.maxRedemptionPerTransaction} coins`)
    }
  }

  async hasPendingEarnRequests(userId: string, brandId: string): Promise<boolean> {
    const pendingTransaction = await this.transactionRepository.findOne({
      where: {
        user: { id: userId },
        brand: { id: brandId },
        status: 'PENDING',
        type: 'EARN'
      }
    })

    return !!pendingTransaction
  }

  async canProcessRedeemRequest(userId: string, brandId: string): Promise<boolean> {
    const balance = await this.getUserBalance(userId)
    const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } })
    
    if (!brand) {
      return false
    }

    // Check if user has sufficient balance
    const userBalance = BigInt(balance.balance)
    if (userBalance <= 0n) {
      return false
    }

    // Check if brand allows redemption
    if (!brand.isActive) {
      return false
    }

    return true
  }

  /**
   * Validate that a user has sufficient balance for redemption
   */
  async validateSufficientBalance(userId: string, coinsToRedeem: number): Promise<void> {
    const balance = await this.getUserBalance(userId)
    
    if (BigInt(balance.balance) < BigInt(coinsToRedeem)) {
      throw new BadRequestException(
        `Insufficient balance. You have ${balance.balance} coins but trying to redeem ${coinsToRedeem} coins`
      )
    }
  }

  /**
   * Validate that a transaction won't result in negative balance
   */
  async validateNoNegativeBalance(userId: string, coinsEarned: number, coinsRedeemed: number): Promise<void> {
    const balance = await this.getUserBalance(userId)
    const finalBalance = BigInt(balance.balance) + BigInt(coinsEarned) - BigInt(coinsRedeemed)
    
    if (finalBalance < 0n) {
      throw new BadRequestException('Transaction would result in negative balance')
    }
  }

  /**
   * Validate brand earning limits
   */
  async validateBrandEarningLimits(brandId: string, coinsEarned: number): Promise<void> {
    const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } })
    
    if (!brand) {
      throw new NotFoundException('Brand not found or inactive')
    }

    if (brand.maxEarningPerTransaction && coinsEarned > brand.maxEarningPerTransaction) {
      throw new BadRequestException(
        `Maximum earning for ${brand.name} is ${brand.maxEarningPerTransaction} coins per transaction`
      )
    }
  }

  /**
   * Validate brand redemption limits
   */
  async validateBrandRedemptionLimits(brandId: string, billAmount: number, coinsToRedeem: number): Promise<void> {
    const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } })
    
    if (!brand) {
      throw new NotFoundException('Brand not found or inactive')
    }

    // Check brand redemption percentage limit
    const maxRedeemableByPercentage = Math.round((billAmount * brand.redemptionPercentage) / 100)
    if (coinsToRedeem > maxRedeemableByPercentage) {
      throw new BadRequestException(
        `Maximum redemption for ${brand.name} is ${maxRedeemableByPercentage} coins (${brand.redemptionPercentage}% of bill amount)`
      )
    }

    // Check brand redemption per-transaction limit
    if (brand.maxRedemptionPerTransaction && coinsToRedeem > brand.maxRedemptionPerTransaction) {
      throw new BadRequestException(
        `Maximum redemption for ${brand.name} is ${brand.maxRedemptionPerTransaction} coins per transaction`
      )
    }

    // Check brand minimum redemption amount
    if (brand.minRedemptionAmount && coinsToRedeem < brand.minRedemptionAmount) {
      throw new BadRequestException(
        `Minimum redemption for ${brand.name} is ${brand.minRedemptionAmount} coins`
      )
    }

    // Check brand maximum redemption amount
    if (brand.maxRedemptionAmount && coinsToRedeem > brand.maxRedemptionAmount) {
      throw new BadRequestException(
        `Maximum redemption for ${brand.name} is ${brand.maxRedemptionAmount} coins`
      )
    }
  }

  /**
   * Validate UPI ID format (basic validation)
   */
  validateUpiId(upiId: string): void {
    if (!upiId || upiId.trim().length === 0) {
      throw new BadRequestException('UPI ID is required when redeeming coins')
    }

    // Basic UPI ID format validation (should contain @ and be reasonable length)
    const trimmedUpiId = upiId.trim()
    if (!trimmedUpiId.includes('@') || trimmedUpiId.length < 5 || trimmedUpiId.length > 50) {
      throw new BadRequestException('Invalid UPI ID format. Please provide a valid UPI ID')
    }
  }

  /**
   * Check for duplicate transactions
   */
  async validateNoDuplicateTransaction(userId: string, brandId: string, billAmount: number, billDate: Date): Promise<void> {
    const existingTransaction = await this.transactionRepository.findOne({
      where: {
        user: { id: userId },
        brand: { id: brandId },
        billAmount: billAmount,
        billDate: billDate,
        status: 'PENDING'
      }
    })

    if (existingTransaction) {
      throw new BadRequestException('A pending reward request already exists for this bill')
    }
  }

  private async getUserBalance(userId: string): Promise<CoinBalance> {
    let balance = await this.balanceRepository.findOne({ where: { user: { id: userId } } })
    
    if (!balance) {
      // Create balance if it doesn't exist
      balance = this.balanceRepository.create({
        user: { id: userId } as User,
        balance: '0',
        totalEarned: '0',
        totalRedeemed: '0'
      })
      await this.balanceRepository.save(balance)
    }

    return balance
  }
}
