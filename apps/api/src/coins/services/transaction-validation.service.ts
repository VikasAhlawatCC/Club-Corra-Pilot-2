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
    const { brandId, billAmount, billDate, coinsToRedeem = 0 } = createRewardRequestDto

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

    // Validate bill amount limits (whole numbers only)
    if (!Number.isInteger(billAmount) || billAmount < 1 || billAmount > 100000) {
      throw new BadRequestException('Bill amount must be a whole number between 1 and 100,000')
    }

    // Validate bill date (not future, not too old - max 30 days)
    const billDateObj = new Date(billDate)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (billDateObj > now) {
      throw new BadRequestException('Bill date cannot be in the future')
    }

    if (billDateObj < thirtyDaysAgo) {
      throw new BadRequestException('Bill date cannot be older than 30 days')
    }

    // Check for duplicate submissions (same user, brand, bill amount, and date)
    const existingTransaction = await this.transactionRepository.findOne({
      where: {
        user: { id: userId },
        brand: { id: brandId },
        billAmount: billAmount,
        billDate: billDateObj,
        status: 'PENDING'
      }
    })

    if (existingTransaction) {
      throw new BadRequestException('A pending reward request already exists for this bill')
    }

    // Note: Removed 1-hour validation restriction - users can now submit multiple requests as needed

    // Validate redemption amount
    if (coinsToRedeem > 0) {
      const balance = await this.getUserBalance(userId)
      if (balance.balance < coinsToRedeem) {
        throw new BadRequestException('Insufficient coin balance for redemption')
      }

      // Check brand redemption limits
      if (brand.maxRedemptionPerTransaction && coinsToRedeem > brand.maxRedemptionPerTransaction) {
        throw new BadRequestException(`Maximum redemption amount for this brand is ${brand.maxRedemptionPerTransaction} coins`)
      }
    }

    // Check brand earning caps
    if (brand.maxEarningPerTransaction) {
      const netBillAmount = billAmount - coinsToRedeem
      const potentialEarning = Math.round((netBillAmount * brand.earningPercentage) / 100)
      if (potentialEarning > brand.maxEarningPerTransaction) {
        throw new BadRequestException(`Maximum earning amount for this brand is ${brand.maxEarningPerTransaction} coins`)
      }
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
    if (balance.balance < coinsToRedeem) {
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
    const userBalance = balance.balance
    if (userBalance <= 0) {
      return false
    }

    // Check if brand allows redemption
    if (!brand.isActive) {
      return false
    }

    return true
  }

  private async getUserBalance(userId: string): Promise<CoinBalance> {
    let balance = await this.balanceRepository.findOne({ where: { user: { id: userId } } })
    
    if (!balance) {
      // Create balance if it doesn't exist
      balance = this.balanceRepository.create({
        user: { id: userId } as User,
        balance: 0
      })
      await this.balanceRepository.save(balance)
    }

    return balance
  }
}
