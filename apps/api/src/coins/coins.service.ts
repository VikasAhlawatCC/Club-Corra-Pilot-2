import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { CoinBalance } from './entities/coin-balance.entity';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { Brand } from '../brands/entities/brand.entity';
import { User } from '../users/entities/user.entity';
import { PaymentDetails } from '../users/entities/payment-details.entity';
import { TransactionValidationService } from './services/transaction-validation.service';
import { TransactionApprovalService } from './services/transaction-approval.service';
import { BalanceUpdateService } from './services/balance-update.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { RewardRequestResponseDto } from './dto/reward-request-response.dto';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(CoinBalance)
    private readonly balanceRepository: Repository<CoinBalance>,
    @InjectRepository(CoinTransaction)
    public readonly transactionRepository: Repository<CoinTransaction>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly transactionValidationService: TransactionValidationService,
    private readonly transactionApprovalService: TransactionApprovalService,
    private readonly balanceUpdateService: BalanceUpdateService,
  ) {}

  async createRewardRequest(userId: string, createRewardRequestDto: CreateRewardRequestDto): Promise<RewardRequestResponseDto> {
    const { brandId, billAmount, billDate, receiptUrl, coinsToRedeem = 0, upiId } = createRewardRequestDto;

    // For temporary users (unauthenticated), skip user validation
    let user = null;
    if (!userId.startsWith('temp_')) {
      // Validate the request using the validation service
      await this.transactionValidationService.validateRewardRequest(userId, createRewardRequestDto);
      user = await this.userRepository.findOne({ where: { id: userId } });
    }

    let brand = await this.brandRepository.findOne({ where: { id: brandId } });
    
    // For temporary users, create a mock brand if it doesn't exist
    if (!brand && userId.startsWith('temp_')) {
      const mockBrands: Record<string, any> = {
        '550e8400-e29b-41d4-a716-446655440001': {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Adidas',
          earningPercentage: 5,
          redemptionPercentage: 2,
          isActive: true
        },
        '550e8400-e29b-41d4-a716-446655440002': {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Nike',
          earningPercentage: 4,
          redemptionPercentage: 2,
          isActive: true
        }
      };
      
      const mockBrand = mockBrands[brandId];
      if (mockBrand) {
        // Create a mock brand object that matches the Brand entity structure
        brand = {
          id: mockBrand.id,
          name: mockBrand.name,
          earningPercentage: mockBrand.earningPercentage,
          redemptionPercentage: mockBrand.redemptionPercentage,
          isActive: mockBrand.isActive,
        } as any;
      }
    }

    // Calculate coins earned based on brand's earning percentage (whole numbers only)
    const netBillAmount = billAmount - coinsToRedeem;
    const coinsEarnedRaw = (netBillAmount * (brand?.earningPercentage || 0)) / 100;
    const coinsEarned = Math.max(1, Math.round(coinsEarnedRaw)); // Ensure whole number

    // Get current user balance and totals for tracking (only for authenticated users)
    let currentBalance = '0';
    let totalEarned = '0';
    let totalRedeemed = '0';
    if (user) {
      const userBalance = await this.balanceRepository.findOne({ where: { user: { id: user.id } } });
      currentBalance = userBalance?.balance || '0';
      totalEarned = userBalance?.totalEarned || '0';
      totalRedeemed = userBalance?.totalRedeemed || '0';
    }

    // CRITICAL FIX: Wrap transaction creation and balance update in database transaction
    // This prevents race conditions and ensures data consistency
    const savedTransaction = await this.transactionRepository.manager.transaction(async (manager) => {
      // Create transaction with all new fields
      const transaction = manager.create(CoinTransaction, {
        user: user,
        brand: brand,
        amount: (coinsEarned - coinsToRedeem).toString(),
        type: 'REWARD_REQUEST',
        status: 'PENDING',
        billAmount: billAmount,
        coinsEarned: coinsEarned,
        coinsRedeemed: coinsToRedeem,
        receiptUrl: receiptUrl,
        billDate: new Date(billDate),
        statusUpdatedAt: new Date(),
        // Balance tracking fields for reversion on rejection
        previousBalance: currentBalance,
        balanceAfterEarn: (BigInt(currentBalance) + BigInt(coinsEarned)).toString(),
        balanceAfterRedeem: (BigInt(currentBalance) + BigInt(coinsEarned) - BigInt(coinsToRedeem)).toString(),
      });

      const savedTransaction = await manager.save(CoinTransaction, transaction);

      // BUSINESS RULE: Immediately update user balance when transaction is submitted
      // This ensures users see their updated balance right after submission
      if (user) {
        // Update balance with proper tracking of totalEarned and totalRedeemed
        await this.balanceUpdateService.updateBalanceForRewardRequest(manager, userId, coinsEarned, coinsToRedeem);
        
        // Save UPI ID if provided and user doesn't have one saved yet
        if (upiId && coinsToRedeem > 0) {
          const userWithPaymentDetails = await manager.findOne(User, {
            where: { id: userId },
            relations: ['paymentDetails']
          });
          
          if (userWithPaymentDetails) {
            if (!userWithPaymentDetails.paymentDetails) {
              // Create payment details if they don't exist
              const paymentDetails = manager.create(PaymentDetails, {
                userId: userId,
                upiId: upiId,
                user: { id: userId } as User,
              });
              await manager.save(PaymentDetails, paymentDetails);
            } else if (!userWithPaymentDetails.paymentDetails.upiId) {
              // Update UPI ID if user doesn't have one saved
              userWithPaymentDetails.paymentDetails.upiId = upiId;
              await manager.save(PaymentDetails, userWithPaymentDetails.paymentDetails);
            }
          }
        }
      }

      return savedTransaction;
    });

    // Get updated balance and transaction list for response
    const balance = await this.balanceUpdateService.getUserBalance(userId);
    const optimisticBalance = await this.balanceUpdateService.getOptimisticBalance(userId, savedTransaction);
    
    // Get recent transactions
    const recentTransactions = await this.getAllTransactions(1, 5, { userId });

    return {
      success: true,
      message: 'Reward request submitted successfully',
      transaction: {
        id: savedTransaction.id,
        type: savedTransaction.type,
        status: savedTransaction.status,
        billAmount: savedTransaction.billAmount || 0,
        billDate: savedTransaction.billDate || new Date(),
        coinsEarned: savedTransaction.coinsEarned || 0,
        coinsRedeemed: savedTransaction.coinsRedeemed || 0,
        brand: brand || null,
        createdAt: savedTransaction.createdAt,
      },
      newBalance: optimisticBalance,
      transactions: recentTransactions.data,
      total: recentTransactions.total,
      page: recentTransactions.page,
      limit: recentTransactions.limit,
      totalPages: recentTransactions.totalPages,
    };
  }


  async createWelcomeBonus(userId: string): Promise<CoinTransaction> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already received welcome bonus
    const existingBonus = await this.transactionRepository.findOne({
      where: { 
        user: { id: userId },
        type: 'WELCOME_BONUS'
      },
    });

    if (existingBonus) {
      throw new BadRequestException('User already received welcome bonus');
    }

    // Default welcome bonus amount
    const amount = 100;

    // Create transaction
    const transaction = this.transactionRepository.create({
      user: user,
      amount: amount.toString(),
      type: 'WELCOME_BONUS',
      status: 'COMPLETED',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update user balance (welcome bonus is approved immediately)
    await this.updateUserBalance(userId, amount);

    return savedTransaction;
  }

  async createEarnTransaction(userId: string, brandId: string, billAmount: number): Promise<CoinTransaction> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate brand exists and is active
    const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } });
    if (!brand) {
      throw new NotFoundException('Brand not found or inactive');
    }

    // Calculate coins earned based on brand's earning percentage
    const coinsEarnedRaw = (billAmount * brand.earningPercentage) / 100;
    const coinsEarned = Math.max(1, Math.round(coinsEarnedRaw));

    // Create transaction
    const transaction = this.transactionRepository.create({
      user: user,
      brand: brand,
      amount: coinsEarned.toString(),
      type: 'EARN',
      status: 'COMPLETED',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update user balance
    await this.updateUserBalance(userId, coinsEarned);

    return savedTransaction;
  }

  async createRedeemTransaction(userId: string, brandId: string, billAmount: number): Promise<CoinTransaction> {
    const brand = await this.brandRepository.findOne({ where: { id: brandId } });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
  
    const balance = await this.getUserBalance(userId);
    if (BigInt(balance.balance) < BigInt(billAmount)) {
      throw new BadRequestException('Insufficient balance');
    }
  
    const transaction = this.transactionRepository.create({
      user: { id: userId },
      brand: { id: brandId },
      amount: (-billAmount).toString(),
      type: 'REDEEM',
      status: 'COMPLETED',
      billAmount,
      coinsRedeemed: billAmount,
    });
  
    const savedTransaction = await this.transactionRepository.save(transaction);
  
    await this.updateUserBalance(userId, -billAmount);


    return savedTransaction;
  }

  async getUserBalance(userId: string): Promise<CoinBalance> {
    let balance = await this.balanceRepository.findOne({ 
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!balance) {
      try {
        // Create new balance record
        balance = this.balanceRepository.create({
          user: { id: userId },
          balance: '0',
          totalEarned: '0',
          totalRedeemed: '0',
        });
        await this.balanceRepository.save(balance);
      } catch (error: any) {
        // Handle race condition
        if (error.code === '23505') {
          balance = await this.balanceRepository.findOne({ 
            where: { user: { id: userId } },
            relations: ['user']
          });
          if (!balance) {
            throw new Error('Failed to create or retrieve balance record');
          }
        } else {
          throw error;
        }
      }
    }

    return balance;
  }

  async updateUserBalance(userId: string, amount: number): Promise<void> {
    const balance = await this.getUserBalance(userId);
    balance.balance = (BigInt(balance.balance) + BigInt(amount)).toString();
    await this.balanceRepository.save(balance);
  }

  /**
   * Update user balance for reward requests with proper tracking of totalEarned and totalRedeemed
   * This method ensures that both earned and redeemed amounts are tracked separately
   */
  async updateUserBalanceForRewardRequest(userId: string, coinsEarned: number, coinsRedeemed: number): Promise<void> {
    const balance = await this.getUserBalance(userId);
    
    // Update balance: add earned coins, subtract redeemed coins
    balance.balance = (BigInt(balance.balance) + BigInt(coinsEarned) - BigInt(coinsRedeemed)).toString();
    
    // Track totalEarned and totalRedeemed separately
    if (coinsEarned > 0) {
      balance.totalEarned = (BigInt(balance.totalEarned) + BigInt(coinsEarned)).toString();
    }
    if (coinsRedeemed > 0) {
      balance.totalRedeemed = (BigInt(balance.totalRedeemed) + BigInt(coinsRedeemed)).toString();
    }

    await this.balanceRepository.save(balance);
  }

  async revertUserBalance(userId: string, targetBalance: number): Promise<void> {
    const balance = await this.getUserBalance(userId);
    const currentBalance = BigInt(balance.balance);
    const difference = BigInt(targetBalance) - currentBalance;

    // Set the balance to the target value
    balance.balance = (currentBalance + BigInt(targetBalance)).toString();
    
    // Adjust the totals based on the difference
    if (difference > 0) {
      // Balance was reduced, so we need to reduce totalEarned
      balance.totalEarned = (BigInt(balance.totalEarned) - BigInt(difference)).toString();
    } else if (difference < 0) {
      // Balance was increased, so we need to reduce totalRedeemed
      balance.totalRedeemed = (BigInt(balance.totalRedeemed) - BigInt(difference)).toString();
    }

    await this.balanceRepository.save(balance);
  }

  /**
   * Revert user balance for a specific transaction with proper tracking of totalEarned and totalRedeemed
   * This method is used when a transaction is rejected and we need to revert the balance changes
   */
  async revertUserBalanceForTransaction(userId: string, transaction: CoinTransaction): Promise<void> {
    const balance = await this.getUserBalance(userId);
    
    // Revert balance to previous state
    balance.balance = transaction.previousBalance || '0';
    
    // Revert totalEarned if coins were earned
    if (transaction.coinsEarned && transaction.coinsEarned > 0) {
      balance.totalEarned = (BigInt(balance.totalEarned) - BigInt(transaction.coinsEarned)).toString();
    }
    
    // Revert totalRedeemed if coins were redeemed
    if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
      balance.totalRedeemed = (BigInt(balance.totalRedeemed) - BigInt(transaction.coinsRedeemed)).toString();
    }

    await this.balanceRepository.save(balance);
  }

  async adminAdjustUserBalance(userId: string, delta: number, reason?: string): Promise<CoinTransaction> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roundedDelta = Math.round(delta);
    if (!roundedDelta || roundedDelta === 0) {
      throw new BadRequestException('Adjustment amount cannot be zero');
    }

    // Create adjustment transaction
    const transaction = this.transactionRepository.create({
      user: { id: userId },
      amount: roundedDelta.toString(),
      type: 'ADJUSTMENT',
      status: 'COMPLETED',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update balance
    await this.updateUserBalance(userId, roundedDelta);

    return savedTransaction;
  }

  async getTransactionHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['brand'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTransactionHistoryWithFilters(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters: {
      type?: string;
      status?: string;
      brandId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.brand', 'brand')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }
    if (filters.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: filters.status });
    }
    if (filters.brandId) {
      queryBuilder.andWhere('transaction.brandId = :brandId', { brandId: filters.brandId });
    }
    if (filters.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findTransactionByIdForUser(userId: string, id: string): Promise<CoinTransaction | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['brand', 'user'],
    });
    return transaction ?? null;
  }

  // Admin approval methods
  async approveTransaction(
    transactionId: string,
    adminUserId: string,
    adminNotes?: string,
  ): Promise<CoinTransaction> {
    console.log('[Service] approveTransaction called:', { transactionId, adminUserId, adminNotes });
    
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'brand', 'user.paymentDetails'],
    });

    if (!transaction) {
      console.error('[Service] Transaction not found:', transactionId);
      throw new NotFoundException('Transaction not found');
    }

    console.log('[Service] Found transaction:', { 
      id: transaction.id, 
      status: transaction.status, 
      coinsRedeemed: transaction.coinsRedeemed,
      coinsEarned: transaction.coinsEarned,
      type: transaction.type
    });

    if (transaction.status !== 'PENDING') {
      console.error('[Service] Transaction is not pending:', transaction.status);
      throw new BadRequestException('Transaction is not pending');
    }

    // Check if there are older pending transactions for the same user
    if (transaction.user) {
      const olderPendingTransactions = await this.transactionRepository.find({
        where: {
          user: { id: transaction.user.id },
          status: 'PENDING',
        },
        order: { createdAt: 'ASC' },
      });

      // If there are older pending transactions, prevent approval
      if (olderPendingTransactions.length > 0 && olderPendingTransactions[0].id !== transactionId) {
        throw new BadRequestException('Cannot approve this transaction. Please review older pending transactions first.');
      }
    }

    // Validate that user has sufficient balance for redemption (prevent negative balances)
    if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0 && transaction.user) {
      console.log('[Service] Checking user balance for redemption:', { 
        userId: transaction.user.id, 
        coinsRedeemed: transaction.coinsRedeemed 
      });
      
      try {
        const userBalance = await this.balanceRepository.findOne({ where: { user: { id: transaction.user.id } } });
        console.log('[Service] User balance found:', { 
          balance: userBalance?.balance, 
          userId: transaction.user.id 
        });
        
        const currentBalance = BigInt(userBalance?.balance || '0');
        const redeemAmount = BigInt(transaction.coinsRedeemed);
        
        console.log('[Service] Balance comparison:', { 
          currentBalance: currentBalance.toString(), 
          redeemAmount: redeemAmount.toString() 
        });
        
        if (currentBalance < redeemAmount) {
          console.error('[Service] Insufficient balance for redemption');
          throw new BadRequestException(`Cannot approve transaction. User has ${currentBalance} coins but trying to redeem ${transaction.coinsRedeemed} coins. This would result in a negative balance.`);
        }
      } catch (balanceError) {
        console.error('[Service] Error checking user balance:', balanceError);
        throw balanceError;
      }
    }

    // Determine the new status based on redemption amount
    let newStatus: string;
    if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
      // TODO: Change to 'UNPAID' once the enum value is added to the database
      newStatus = 'APPROVED'; // Needs payment processing (temporary - should be UNPAID)
    } else {
      newStatus = 'PAID'; // No redemption, automatically paid
    }

    // Update transaction status
    transaction.status = newStatus as any;
    transaction.processedAt = new Date();
    transaction.statusUpdatedAt = new Date();
    if (adminNotes) {
      transaction.adminNotes = adminNotes;
    }
    
    console.log('[Service] Saving transaction with new status:', newStatus);
    try {
      const savedTransaction = await this.transactionRepository.save(transaction);
      console.log('[Service] Transaction saved successfully:', { id: savedTransaction.id, status: savedTransaction.status });
      return savedTransaction;
    } catch (saveError) {
      console.error('[Service] Error saving transaction:', saveError);
      throw saveError;
    }

    // CRITICAL FIX: Remove duplicate balance update
    // Balance is already updated at submission time (Business Rule #2)
    // No need to update balance again on approval since it was already applied
  }

  async rejectTransaction(
    transactionId: string,
    adminUserId: string,
    adminNotes: string,
  ): Promise<CoinTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'brand'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException('Transaction is not pending');
    }

    // Check if there are older pending transactions for the same user
    if (transaction.user) {
      const olderPendingTransactions = await this.transactionRepository.find({
        where: {
          user: { id: transaction.user.id },
          status: 'PENDING',
        },
        order: { createdAt: 'ASC' },
      });

      // If there are older pending transactions, prevent rejection
      if (olderPendingTransactions.length > 0 && olderPendingTransactions[0].id !== transactionId) {
        throw new BadRequestException('Cannot reject this transaction. Please review older pending transactions first.');
      }
    }

    // CRITICAL FIX: Revert coin balance changes when transaction is rejected
    // This implements Business Rule #3: Coin Reversion on Rejection
    if (transaction.user && transaction.previousBalance !== undefined) {
      // Revert balance using the new method that properly handles totalEarned and totalRedeemed
      await this.revertUserBalanceForTransaction(transaction.user.id, transaction);
    }

    // Update transaction status
    transaction.status = 'REJECTED';
    transaction.adminNotes = adminNotes;
    transaction.statusUpdatedAt = new Date();
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  async markRedeemTransactionAsPaid(
    transactionId: string,
    markPaidDto: { transactionId: string; adminNotes?: string },
  ): Promise<CoinTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'brand'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'UNPAID') {
      throw new BadRequestException('Transaction must be in UNPAID status to mark as paid');
    }

    // Validate that transaction has redemption amount
    if (!transaction.coinsRedeemed || transaction.coinsRedeemed <= 0) {
      throw new BadRequestException('Only transactions with redemption amounts can be marked as paid');
    }

    // Validate transaction ID format (basic UPI reference validation)
    if (!markPaidDto.transactionId || markPaidDto.transactionId.trim().length < 5) {
      throw new BadRequestException('Valid transaction ID is required (minimum 5 characters)');
    }

    // Update transaction status
    transaction.status = 'PAID';
    transaction.paymentProcessedAt = new Date();
    transaction.statusUpdatedAt = new Date();
    transaction.transactionId = markPaidDto.transactionId.trim();
    if (markPaidDto.adminNotes) {
      transaction.adminNotes = (transaction.adminNotes || '') + `\n\nPayment Notes: ${markPaidDto.adminNotes}`;
    }

    await this.transactionRepository.save(transaction);

    return transaction;
  }

  // Admin methods for getting all transactions
  async getAllTransactions(page: number = 1, limit: number = 20, filters: any = {}) {
    try {
      console.log('getAllTransactions called with:', { page, limit, filters });
      
      const skip = (page - 1) * limit;
      
      // Build where clause based on filters
      const whereClause: any = {};
      
      // Filter by user ID if provided (for user-specific queries)
      if (filters.userId) {
        whereClause.user = { id: filters.userId };
      }
      
      // Filter by status if provided
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      // Filter by type if provided
      if (filters.type) {
        whereClause.type = filters.type;
      }
      
      // Filter by brand ID if provided
      if (filters.brandId) {
        whereClause.brand = { id: filters.brandId };
      }
      
      // Use findAndCount with relations to get both data and total count
      const [allTransactions, total] = await this.transactionRepository.findAndCount({
        where: whereClause,
        relations: ['user', 'brand', 'user.paymentDetails'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });
      
      console.log('Found transactions:', allTransactions.length, 'Total:', total);

      // Convert entities to DTOs with proper type conversion
      const { convertToAdminTransactionDto } = await import('./dto/admin-transaction.dto');
      const convertedTransactions = allTransactions.map(convertToAdminTransactionDto);

      return {
        data: convertedTransactions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in getAllTransactions:', error);
      // Return empty result if there's an error
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async getPendingTransactions(page: number = 1, limit: number = 20) {
    return this.getAllTransactions(page, limit, { status: 'PENDING' });
  }

  async getProcessingOrder() {
    try {
      // Get all pending transactions ordered by user and creation date
      const pendingTransactions = await this.transactionRepository.find({
        where: { status: 'PENDING' },
        relations: ['user', 'brand'],
        order: { 
          user: { id: 'ASC' }, // Group by user
          createdAt: 'ASC'      // Then by creation date (oldest first)
        }
      });

      // Group transactions by user and find the oldest for each user
      const userOldestTransaction = new Map<string, string>();
      const processingOrder: any[] = [];

      for (const transaction of pendingTransactions) {
        if (transaction.user) {
          const userId = transaction.user.id;
          
          // If this is the first transaction for this user, it's the oldest
          if (!userOldestTransaction.has(userId)) {
            userOldestTransaction.set(userId, transaction.id);
            
            // Add to processing order
            processingOrder.push({
              transactionId: transaction.id,
              userId: userId,
              userName: transaction.user.profile?.firstName && transaction.user.profile?.lastName 
                ? `${transaction.user.profile.firstName} ${transaction.user.profile.lastName}`
                : transaction.user.profile?.firstName 
                ? transaction.user.profile.firstName
                : transaction.user.mobileNumber 
                ? `User ${transaction.user.mobileNumber.slice(-4)}`
                : 'Unknown User',
              userMobile: transaction.user.mobileNumber || 'N/A',
              createdAt: transaction.createdAt,
              type: transaction.type,
              billAmount: transaction.billAmount,
              brandName: transaction.brand?.name,
              isOldestPending: true
            });
          }
        }
      }

      return processingOrder;
    } catch (error) {
      console.error('Error in getProcessingOrder:', error);
      return [];
    }
  }

  async getTransactionById(id: string): Promise<CoinTransaction | null> {
    return this.transactionRepository.findOne({
      where: { id },
      relations: ['brand', 'user', 'user.paymentDetails'],
    });
  }

  async getTransactionStats() {
    const [
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      failedTransactions,
    ] = await Promise.all([
      this.transactionRepository.count(),
      this.transactionRepository.count({ where: { status: 'PENDING' } }),
      this.transactionRepository.count({ where: { status: 'COMPLETED' } }),
      this.transactionRepository.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      failedTransactions,
    };
  }

  async debugTransactions() {
    try {
      // Test basic count
      const totalCount = await this.transactionRepository.count();
      
      // Test simple find
      const sampleTransactions = await this.transactionRepository.find({
        take: 3,
        order: { createdAt: 'DESC' }
      });
      
      return {
        totalCount,
        sampleCount: sampleTransactions.length,
        sampleTransactions: sampleTransactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          status: tx.status,
          amount: tx.amount,
          createdAt: tx.createdAt
        })),
        message: 'Debug successful'
      };
    } catch (error) {
      console.error('Debug error:', error);
      return { error: (error as Error).message };
    }
  }

  async getCoinSystemStats() {
    try {
      // Get comprehensive coin system statistics
      const [
        totalUsers,
        activeBrands,
        totalTransactions,
        pendingTransactions,
        approvedTransactions,
        rejectedTransactions,
        totalCoinsInCirculation,
        welcomeBonusesGiven,
        pendingRedemptions,
        totalEarned,
        totalRedeemed,
      ] = await Promise.all([
      // Total users
      this.userRepository.count(),
      
      // Active brands
      this.brandRepository.count({ where: { isActive: true } }),
      
      // Transaction counts
      this.transactionRepository.count(),
      this.transactionRepository.count({ where: { status: 'PENDING' } }),
      this.transactionRepository.count({ where: { status: 'COMPLETED' } }),
      this.transactionRepository.count({ where: { status: 'FAILED' } }),
      
      // Total coins in circulation (sum of all user balances)
      this.balanceRepository
        .createQueryBuilder('balance')
        .select('SUM(CAST(balance.balance AS DECIMAL))', 'total')
        .getRawOne()
        .then(result => BigInt(result?.total || '0')),
      
      // Welcome bonuses given (count of WELCOME_BONUS transactions)
      this.transactionRepository.count({ where: { type: 'WELCOME_BONUS' } }),
      
      // Pending redemptions (count of pending REDEEM transactions)
      this.transactionRepository.count({ where: { type: 'REDEEM', status: 'PENDING' } }),
      
      // FIXED: Total earned from coin_balances (includes PENDING transactions per business rules)
      // This shows the actual total that users have earned, including pending requests
      this.balanceRepository
        .createQueryBuilder('balance')
        .select('SUM(CAST(balance.total_earned AS DECIMAL))', 'total')
        .getRawOne()
        .then(result => BigInt(result?.total || '0')),
      
      // FIXED: Total redeemed from coin_balances (includes PENDING transactions per business rules)
      // This shows the actual total that users have redeemed, including pending requests
      this.balanceRepository
        .createQueryBuilder('balance')
        .select('SUM(CAST(balance.total_redeemed AS DECIMAL))', 'total')
        .getRawOne()
        .then(result => BigInt(result?.total || '0')),
    ]);

    // Calculate transaction success rate
    const transactionSuccessRate = totalTransactions > 0 
      ? ((approvedTransactions / totalTransactions) * 100) 
      : 0;

    // Determine system health based on pending transactions and success rate
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (pendingTransactions > 50 || transactionSuccessRate < 80) {
      systemHealth = 'critical';
    } else if (pendingTransactions > 20 || transactionSuccessRate < 90) {
      systemHealth = 'warning';
    }

    return {
      totalCoinsInCirculation: totalCoinsInCirculation.toString(),
      totalUsers,
      welcomeBonusesGiven,
      pendingRedemptions,
      activeBrands,
      systemHealth,
      totalEarned: totalEarned.toString(),
      totalRedeemed: totalRedeemed.toString(),
      totalTransactions,
      approvedTransactions,
      rejectedTransactions,
      transactionSuccessRate,
      pendingEarnRequests: await this.transactionRepository.count({ 
        where: { type: 'EARN', status: 'PENDING' } 
      }),
    };
    } catch (error) {
      console.error('Error in getCoinSystemStats:', error);
      throw error;
    }
  }

  async associateTempTransactionWithUser(tempTransactionId: string, userId: string): Promise<CoinTransaction> {
    // Find the temporary transaction
    const transaction = await this.transactionRepository.findOne({
      where: { id: tempTransactionId },
      relations: ['user', 'brand'],
    });

    if (!transaction) {
      throw new NotFoundException('Temporary transaction not found');
    }

    // Check if transaction is associated with a temporary user
    if (!transaction.user || !transaction.user.id.startsWith('temp_')) {
      throw new BadRequestException('Transaction is not a temporary transaction');
    }

    // Get the real user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the transaction with the real user
    transaction.user = user;
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  // Admin methods for transaction navigation and user-specific queries
  async getUserPendingTransactions(userId: string): Promise<any[]> {
    const transactions = await this.transactionRepository.find({
      where: {
        user: { id: userId },
        status: 'PENDING',
      },
      relations: ['user', 'brand'],
      order: { createdAt: 'ASC' }, // Oldest first
    });

    // Convert to admin DTO format
    const { convertToAdminTransactionDto } = await import('./dto/admin-transaction.dto');
    return transactions.map(convertToAdminTransactionDto);
  }

  async getNextUserTransaction(currentTransactionId: string, userId: string): Promise<CoinTransaction | null> {
    const currentTransaction = await this.transactionRepository.findOne({
      where: { id: currentTransactionId },
      relations: ['user'],
    });

    if (!currentTransaction || !currentTransaction.user) {
      return null;
    }

    // Get the next transaction for the same user (newer)
    const nextTransaction = await this.transactionRepository.findOne({
      where: {
        user: { id: currentTransaction.user.id },
        createdAt: MoreThan(currentTransaction.createdAt),
      },
      relations: ['user', 'brand'],
      order: { createdAt: 'ASC' },
    });

    return nextTransaction;
  }

  async getPreviousUserTransaction(currentTransactionId: string, userId: string): Promise<CoinTransaction | null> {
    const currentTransaction = await this.transactionRepository.findOne({
      where: { id: currentTransactionId },
      relations: ['user'],
    });

    if (!currentTransaction || !currentTransaction.user) {
      return null;
    }

    // Get the previous transaction for the same user (older)
    const previousTransaction = await this.transactionRepository.findOne({
      where: {
        user: { id: currentTransaction.user.id },
        createdAt: LessThan(currentTransaction.createdAt),
      },
      relations: ['user', 'brand'],
      order: { createdAt: 'DESC' },
    });

    return previousTransaction;
  }

  async getOldestPendingTransactionForUser(userId: string): Promise<CoinTransaction | null> {
    return this.transactionRepository.findOne({
      where: {
        user: { id: userId },
        status: 'PENDING',
      },
      relations: ['user', 'brand'],
      order: { createdAt: 'ASC' },
    });
  }

  async getUserVerificationData(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'paymentDetails', 'coinBalance'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pendingRequests = await this.getUserPendingTransactions(userId);

    return {
      user: {
        id: user.id,
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : 'Unknown User',
        email: user.email,
        mobileNumber: user.mobileNumber,
        profile: user.profile,
        paymentDetails: user.paymentDetails,
        coinBalance: (user.coinBalance?.balance || '0').toString(),
        totalEarned: (user.coinBalance?.totalEarned || '0').toString(),
        totalRedeemed: (user.coinBalance?.totalRedeemed || '0').toString(),
      },
      pendingRequests: {
        data: pendingRequests,
        total: pendingRequests.length,
        page: 1,
        limit: pendingRequests.length,
        totalPages: 1,
      },
    };
  }
}
