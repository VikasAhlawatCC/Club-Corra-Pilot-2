import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { CoinBalance } from './entities/coin-balance.entity';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { Brand } from '../brands/entities/brand.entity';
import { User } from '../users/entities/user.entity';
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
    const { brandId, billAmount, billDate, receiptUrl, coinsToRedeem = 0 } = createRewardRequestDto;

    // For temporary users (unauthenticated), skip user validation
    let user = null;
    if (!userId.startsWith('temp_')) {
      // Validate the request using the validation service
      await this.transactionValidationService.validateRewardRequest(userId, createRewardRequestDto);
      user = await this.userRepository.findOne({ where: { id: userId } });
    }

    const brand = await this.brandRepository.findOne({ where: { id: brandId } });

    // Calculate coins earned based on brand's earning percentage
    const netBillAmount = billAmount - coinsToRedeem;
    const coinsEarnedRaw = (netBillAmount * (brand?.earningPercentage || 0)) / 100;
    const coinsEarned = Math.max(1, Math.round(coinsEarnedRaw));

    // Create transaction with all new fields
    const transaction = this.transactionRepository.create({
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
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

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

  async associateTempTransactionWithUser(tempTransactionId: string, userId: string): Promise<CoinTransaction> {
    // Find the temporary transaction
    const tempTransaction = await this.transactionRepository.findOne({
      where: { id: tempTransactionId },
      relations: ['brand']
    });

    if (!tempTransaction) {
      throw new NotFoundException('Temporary transaction not found');
    }

    // Verify it's a temporary transaction (no user associated)
    if (tempTransaction.user) {
      throw new BadRequestException('Transaction is already associated with a user');
    }

    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Associate the transaction with the user
    tempTransaction.user = user;
    const updatedTransaction = await this.transactionRepository.save(tempTransaction);

    return updatedTransaction;
  }

  async getOldestPendingTransactionForUser(userId: string): Promise<CoinTransaction | null> {
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.brand', 'brand')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: 'PENDING' })
      .orderBy('transaction.createdAt', 'ASC')
      .getOne();
  }

  async getUserPendingTransactions(userId: string): Promise<CoinTransaction[]> {
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.brand', 'brand')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: 'PENDING' })
      .orderBy('transaction.createdAt', 'ASC')
      .getMany();
  }

  async getNextUserTransaction(currentTransactionId: string, userId: string): Promise<CoinTransaction | null> {
    const currentTransaction = await this.transactionRepository.findOne({
      where: { id: currentTransactionId }
    });

    if (!currentTransaction) {
      return null;
    }

    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.brand', 'brand')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.createdAt > :createdAt', { createdAt: currentTransaction.createdAt })
      .orderBy('transaction.createdAt', 'ASC')
      .getOne();
  }

  async getPreviousUserTransaction(currentTransactionId: string, userId: string): Promise<CoinTransaction | null> {
    const currentTransaction = await this.transactionRepository.findOne({
      where: { id: currentTransactionId }
    });

    if (!currentTransaction) {
      return null;
    }

    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.brand', 'brand')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.createdAt < :createdAt', { createdAt: currentTransaction.createdAt })
      .orderBy('transaction.createdAt', 'DESC')
      .getOne();
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

    // Calculate coins to redeem based on brand's redemption percentage
    const coinsToRedeemRaw = (billAmount * brand.redemptionPercentage) / 100;
    const coinsToRedeem = Math.max(1, Math.round(coinsToRedeemRaw));

    // Check user has sufficient balance
    const balance = await this.getUserBalance(userId);
    if (parseInt(balance.balance) < coinsToRedeem) {
      throw new BadRequestException('Insufficient coin balance for redemption');
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      user: user,
      brand: brand,
      amount: (-coinsToRedeem).toString(), // Negative amount for redemption
      type: 'REDEEM',
      status: 'COMPLETED',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update user balance (deduct coins)
    await this.updateUserBalance(userId, -coinsToRedeem);

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
    const integerAmount = Math.round(amount);

    balance.balance += integerAmount;
    
    if (integerAmount > 0) {
      balance.totalEarned += integerAmount;
    } else {
      balance.totalRedeemed += Math.abs(integerAmount);
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

      // If there are older pending transactions, prevent approval
      if (olderPendingTransactions.length > 0 && olderPendingTransactions[0].id !== transactionId) {
        throw new BadRequestException('Cannot approve this transaction. Please review older pending transactions first.');
      }
    }

    // Determine the new status based on redemption amount
    let newStatus: string;
    if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
      newStatus = 'UNPAID'; // Needs payment processing
    } else {
      newStatus = 'PAID'; // No redemption, automatically paid
    }

    // Update transaction status
    transaction.status = newStatus as any;
    transaction.adminNotes = adminNotes;
    transaction.statusUpdatedAt = new Date();
    await this.transactionRepository.save(transaction);

    // Update user balance if it's an earn transaction
    if (transaction.type === 'REWARD_REQUEST' || transaction.type === 'EARN') {
      const amount = parseInt(transaction.amount);
      if (amount > 0 && transaction.user) {
        await this.updateUserBalance(transaction.user.id, amount);
      }
    }

    return transaction;
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

    // Update transaction status
    transaction.status = 'REJECTED';
    transaction.adminNotes = adminNotes;
    transaction.statusUpdatedAt = new Date();
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  // Admin methods for getting all transactions
  async getAllTransactions(page: number = 1, limit: number = 20, filters: any = {}) {
    try {
      console.log('getAllTransactions called with:', { page, limit, filters });
      
      const skip = (page - 1) * limit;
      
      // Use findAndCount with relations to get both data and total count
      const [allTransactions, total] = await this.transactionRepository.findAndCount({
        relations: ['user', 'brand'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });
      
      console.log('Found transactions:', allTransactions.length, 'Total:', total);

      return {
        data: allTransactions,
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

  async getTransactionById(id: string): Promise<CoinTransaction | null> {
    return this.transactionRepository.findOne({
      where: { id },
      relations: ['brand', 'user'],
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
        .select('SUM(balance.balance)', 'total')
        .getRawOne()
        .then(result => parseFloat(result?.total || '0')),
      
      // Welcome bonuses given (count of WELCOME_BONUS transactions)
      this.transactionRepository.count({ where: { type: 'WELCOME_BONUS' } }),
      
      // Pending redemptions (count of pending REDEEM transactions)
      this.transactionRepository.count({ where: { type: 'REDEEM', status: 'PENDING' } }),
      
      // Total earned (sum of all EARN transactions)
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: 'EARN' })
        .andWhere('transaction.status = :status', { status: 'COMPLETED' })
        .getRawOne()
        .then(result => parseFloat(result?.total || '0')),
      
      // Total redeemed (sum of all REDEEM transactions)
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(ABS(transaction.amount))', 'total')
        .where('transaction.type = :type', { type: 'REDEEM' })
        .andWhere('transaction.status = :status', { status: 'COMPLETED' })
        .getRawOne()
        .then(result => parseFloat(result?.total || '0')),
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
      totalCoinsInCirculation,
      totalUsers,
      welcomeBonusesGiven,
      pendingRedemptions,
      activeBrands,
      systemHealth,
      totalEarned,
      totalRedeemed,
      totalTransactions,
      approvedTransactions,
      rejectedTransactions,
      transactionSuccessRate,
      pendingEarnRequests: await this.transactionRepository.count({ 
        where: { type: 'EARN', status: 'PENDING' } 
      }),
    };
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
  async getUserPendingTransactions(userId: string): Promise<CoinTransaction[]> {
    return this.transactionRepository.find({
      where: {
        user: { id: userId },
        status: 'PENDING',
      },
      relations: ['user', 'brand'],
      order: { createdAt: 'ASC' }, // Oldest first
    });
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

}
