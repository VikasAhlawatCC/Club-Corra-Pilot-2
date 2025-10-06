"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coin_balance_entity_1 = require("./entities/coin-balance.entity");
const coin_transaction_entity_1 = require("./entities/coin-transaction.entity");
const brand_entity_1 = require("../brands/entities/brand.entity");
const user_entity_1 = require("../users/entities/user.entity");
let CoinsService = class CoinsService {
    constructor(balanceRepository, transactionRepository, brandRepository, userRepository) {
        this.balanceRepository = balanceRepository;
        this.transactionRepository = transactionRepository;
        this.brandRepository = brandRepository;
        this.userRepository = userRepository;
    }
    async createRewardRequest(userId, createRewardRequestDto) {
        const { brandId, billAmount, billDate, receiptUrl, coinsToRedeem = 0 } = createRewardRequestDto;
        // Validate user exists
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Validate brand exists and is active
        const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } });
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found or inactive');
        }
        // Check user has sufficient balance for redemption
        if (coinsToRedeem > 0) {
            const balance = await this.getUserBalance(userId);
            if (balance.balance < coinsToRedeem) {
                throw new common_1.BadRequestException('Insufficient coin balance for redemption');
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
    async createWelcomeBonus(userId) {
        // Validate user exists
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Check if user already received welcome bonus
        const existingBonus = await this.transactionRepository.findOne({
            where: {
                user: { id: userId },
                type: 'WELCOME_BONUS'
            },
        });
        if (existingBonus) {
            throw new common_1.BadRequestException('User already received welcome bonus');
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
    async getUserBalance(userId) {
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
            }
            catch (error) {
                // Handle race condition
                if (error.code === '23505') {
                    balance = await this.balanceRepository.findOne({
                        where: { user: { id: userId } },
                        relations: ['user']
                    });
                    if (!balance) {
                        throw new Error('Failed to create or retrieve balance record');
                    }
                }
                else {
                    throw error;
                }
            }
        }
        return balance;
    }
    async updateUserBalance(userId, amount) {
        const balance = await this.getUserBalance(userId);
        const integerAmount = Math.round(amount);
        balance.balance += integerAmount;
        if (integerAmount > 0) {
            balance.totalEarned += integerAmount;
        }
        else {
            balance.totalRedeemed += Math.abs(integerAmount);
        }
        await this.balanceRepository.save(balance);
    }
    async adminAdjustUserBalance(userId, delta, reason) {
        // Validate user exists
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const roundedDelta = Math.round(delta);
        if (!roundedDelta || roundedDelta === 0) {
            throw new common_1.BadRequestException('Adjustment amount cannot be zero');
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
    async getTransactionHistory(userId, page = 1, limit = 20) {
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
    async getTransactionHistoryWithFilters(userId, page = 1, limit = 20, filters = {}) {
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
    async findTransactionByIdForUser(userId, id) {
        const transaction = await this.transactionRepository.findOne({
            where: { id, user: { id: userId } },
            relations: ['brand', 'user'],
        });
        return transaction ?? null;
    }
    // Admin approval methods
    async approveTransaction(transactionId, adminUserId, adminNotes) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['user', 'brand'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status !== 'PENDING') {
            throw new common_1.BadRequestException('Transaction is not pending');
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
    async rejectTransaction(transactionId, adminUserId, adminNotes) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['user', 'brand'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status !== 'PENDING') {
            throw new common_1.BadRequestException('Transaction is not pending');
        }
        // Update transaction status
        transaction.status = 'FAILED';
        await this.transactionRepository.save(transaction);
        return transaction;
    }
    // Admin methods for getting all transactions
    async getAllTransactions(page = 1, limit = 20, filters = {}) {
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
    async getPendingTransactions(page = 1, limit = 20) {
        return this.getAllTransactions(page, limit, { status: 'PENDING' });
    }
    async getTransactionById(id) {
        return this.transactionRepository.findOne({
            where: { id },
            relations: ['brand', 'user'],
        });
    }
    async getTransactionStats() {
        const [totalTransactions, pendingTransactions, completedTransactions, failedTransactions,] = await Promise.all([
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
};
exports.CoinsService = CoinsService;
exports.CoinsService = CoinsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coin_balance_entity_1.CoinBalance)),
    __param(1, (0, typeorm_1.InjectRepository)(coin_transaction_entity_1.CoinTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CoinsService);
