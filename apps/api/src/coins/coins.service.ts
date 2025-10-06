import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CoinBalance } from './entities/coin-balance.entity';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { Brand } from '../brands/entities/brand.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(CoinBalance)
    private readonly balanceRepository: Repository<CoinBalance>,
    @InjectRepository(CoinTransaction)
    private readonly transactionRepository: Repository<CoinTransaction>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createRewardRequest(userId: string, createRewardRequestDto: any): Promise<CoinTransaction> {
    const { brandId, billAmount, billDate, receiptUrl, coinsToRedeem = 0 } = createRewardRequestDto;

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

    // Check user has sufficient balance for redemption
    if (coinsToRedeem > 0) {
      const balance = await this.getUserBalance(userId);
      if (balance.balance < coinsToRedeem) {
        throw new BadRequestException('Insufficient coin balance for redemption');
      }
    }

    // Calculate coins earned based on brand's earning percentage
    const netBillAmount = billAmount - coinsToRedeem;
    const coinsEarnedRaw = (netBillAmount * brand.earningPercentage) / 100;
    const coinsEarned = Math.max(1, Math.round(coinsEarnedRaw));

    // Calculate net amount (coinsEarned - coinsRedeemed)
    const netAmount = coinsEarned - coinsToRedeem;

    // Create transaction
    const transaction = this.transactionRepository.create({
      user: { id: userId },
      amount: netAmount.toString(),
      type: 'REWARD_REQUEST',
      status: 'PENDING',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);
    savedTransaction.brand = brand;
    savedTransaction.user = user;

    return savedTransaction;
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
      user: { id: userId },
      amount: amount.toString(),
      type: 'WELCOME_BONUS',
      status: 'COMPLETED',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update user balance (welcome bonus is approved immediately)
    await this.updateUserBalance(userId, amount);

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

    // Update transaction status
    transaction.status = 'COMPLETED';
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

    // Update transaction status
    transaction.status = 'FAILED';
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  // Admin methods for getting all transactions
  async getAllTransactions(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.brand', 'brand')
      .leftJoinAndSelect('transaction.user', 'user')
      .orderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: filters.status });
    }
    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }
    if (filters.brandId) {
      queryBuilder.andWhere('transaction.brandId = :brandId', { brandId: filters.brandId });
    }
    if (filters.userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId: filters.userId });
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
}
