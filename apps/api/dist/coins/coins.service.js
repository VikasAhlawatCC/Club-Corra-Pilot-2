"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const transaction_validation_service_1 = require("./services/transaction-validation.service");
const transaction_approval_service_1 = require("./services/transaction-approval.service");
const balance_update_service_1 = require("./services/balance-update.service");
let CoinsService = class CoinsService {
    constructor(balanceRepository, transactionRepository, brandRepository, userRepository, transactionValidationService, transactionApprovalService, balanceUpdateService) {
        this.balanceRepository = balanceRepository;
        this.transactionRepository = transactionRepository;
        this.brandRepository = brandRepository;
        this.userRepository = userRepository;
        this.transactionValidationService = transactionValidationService;
        this.transactionApprovalService = transactionApprovalService;
        this.balanceUpdateService = balanceUpdateService;
    }
    async createRewardRequest(userId, createRewardRequestDto) {
        const { brandId, billAmount, billDate, receiptUrl, coinsToRedeem = 0 } = createRewardRequestDto;
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
            const mockBrands = {
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
                };
            }
        }
        // Calculate coins earned based on brand's earning percentage (whole numbers only)
        const netBillAmount = billAmount - coinsToRedeem;
        const coinsEarnedRaw = (netBillAmount * (brand?.earningPercentage || 0)) / 100;
        const coinsEarned = Math.max(1, Math.round(coinsEarnedRaw)); // Ensure whole number
        // Get current user balance for tracking (only for authenticated users)
        let currentBalance = 0;
        if (user) {
            const userBalance = await this.balanceRepository.findOne({ where: { user: { id: user.id } } });
            currentBalance = userBalance?.balance || 0;
        }
        // Create transaction with all new fields including balance tracking
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
            // Balance tracking fields for reversion on rejection
            previousBalance: currentBalance,
            balanceAfterEarn: currentBalance + coinsEarned,
            balanceAfterRedeem: currentBalance + coinsEarned - coinsToRedeem,
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
    async createEarnTransaction(userId, brandId, billAmount) {
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
    async createRedeemTransaction(userId, brandId, billAmount) {
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
        // Calculate coins to redeem based on brand's redemption percentage
        const coinsToRedeemRaw = (billAmount * brand.redemptionPercentage) / 100;
        const coinsToRedeem = Math.max(1, Math.round(coinsToRedeemRaw));
        // Check user has sufficient balance
        const balance = await this.getUserBalance(userId);
        if (balance.balance < coinsToRedeem) {
            throw new common_1.BadRequestException('Insufficient coin balance for redemption');
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
                    balance: 0,
                    totalEarned: 0,
                    totalRedeemed: 0,
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
    async revertUserBalance(userId, targetBalance) {
        const balance = await this.getUserBalance(userId);
        const currentBalance = balance.balance;
        const difference = targetBalance - currentBalance;
        // Set the balance to the target value
        balance.balance = targetBalance;
        // Adjust the totals based on the difference
        if (difference > 0) {
            // Balance was reduced, so we need to reduce totalEarned
            balance.totalEarned = Math.max(0, balance.totalEarned - difference);
        }
        else if (difference < 0) {
            // Balance was increased, so we need to reduce totalRedeemed
            balance.totalRedeemed = Math.max(0, balance.totalRedeemed + difference);
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
                throw new common_1.BadRequestException('Cannot approve this transaction. Please review older pending transactions first.');
            }
        }
        // Validate that user has sufficient balance for redemption (prevent negative balances)
        if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0 && transaction.user) {
            const userBalance = await this.balanceRepository.findOne({ where: { user: { id: transaction.user.id } } });
            const currentBalance = userBalance?.balance || 0;
            if (currentBalance < transaction.coinsRedeemed) {
                throw new common_1.BadRequestException(`Cannot approve transaction. User has ${currentBalance} coins but trying to redeem ${transaction.coinsRedeemed} coins. This would result in a negative balance.`);
            }
        }
        // Determine the new status based on redemption amount
        let newStatus;
        if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
            newStatus = 'UNPAID'; // Needs payment processing
        }
        else {
            newStatus = 'PAID'; // No redemption, automatically paid
        }
        // Update transaction status
        transaction.status = newStatus;
        transaction.adminNotes = adminNotes;
        transaction.statusUpdatedAt = new Date();
        await this.transactionRepository.save(transaction);
        // Update user balance with proper tracking for reversion
        if (transaction.type === 'REWARD_REQUEST' || transaction.type === 'EARN') {
            if (transaction.user) {
                // Update balance: add earned coins, subtract redeemed coins
                const netAmount = (transaction.coinsEarned || 0) - (transaction.coinsRedeemed || 0);
                if (netAmount !== 0) {
                    await this.updateUserBalance(transaction.user.id, netAmount);
                }
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
                throw new common_1.BadRequestException('Cannot reject this transaction. Please review older pending transactions first.');
            }
        }
        // Revert coin balance changes if transaction was previously approved
        // Note: This check is for cases where a transaction might have been approved and then rejected
        if (transaction.status === 'PAID' || transaction.status === 'UNPAID') {
            if (transaction.user && transaction.previousBalance !== undefined) {
                // Revert to previous balance
                await this.revertUserBalance(transaction.user.id, transaction.previousBalance);
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
    async getAllTransactions(page = 1, limit = 20, filters = {}) {
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
            // Convert entities to DTOs with proper type conversion
            const { convertToAdminTransactionDto } = await Promise.resolve().then(() => __importStar(require('./dto/admin-transaction.dto')));
            const convertedTransactions = allTransactions.map(convertToAdminTransactionDto);
            return {
                data: convertedTransactions,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Debug error:', error);
            return { error: error.message };
        }
    }
    async getCoinSystemStats() {
        // Get comprehensive coin system statistics
        const [totalUsers, activeBrands, totalTransactions, pendingTransactions, approvedTransactions, rejectedTransactions, totalCoinsInCirculation, welcomeBonusesGiven, pendingRedemptions, totalEarned, totalRedeemed,] = await Promise.all([
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
        let systemHealth = 'healthy';
        if (pendingTransactions > 50 || transactionSuccessRate < 80) {
            systemHealth = 'critical';
        }
        else if (pendingTransactions > 20 || transactionSuccessRate < 90) {
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
    async associateTempTransactionWithUser(tempTransactionId, userId) {
        // Find the temporary transaction
        const transaction = await this.transactionRepository.findOne({
            where: { id: tempTransactionId },
            relations: ['user', 'brand'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Temporary transaction not found');
        }
        // Check if transaction is associated with a temporary user
        if (!transaction.user || !transaction.user.id.startsWith('temp_')) {
            throw new common_1.BadRequestException('Transaction is not a temporary transaction');
        }
        // Get the real user
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Update the transaction with the real user
        transaction.user = user;
        await this.transactionRepository.save(transaction);
        return transaction;
    }
    // Admin methods for transaction navigation and user-specific queries
    async getUserPendingTransactions(userId) {
        return this.transactionRepository.find({
            where: {
                user: { id: userId },
                status: 'PENDING',
            },
            relations: ['user', 'brand'],
            order: { createdAt: 'ASC' }, // Oldest first
        });
    }
    async getNextUserTransaction(currentTransactionId, userId) {
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
                createdAt: (0, typeorm_2.MoreThan)(currentTransaction.createdAt),
            },
            relations: ['user', 'brand'],
            order: { createdAt: 'ASC' },
        });
        return nextTransaction;
    }
    async getPreviousUserTransaction(currentTransactionId, userId) {
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
                createdAt: (0, typeorm_2.LessThan)(currentTransaction.createdAt),
            },
            relations: ['user', 'brand'],
            order: { createdAt: 'DESC' },
        });
        return previousTransaction;
    }
    async getOldestPendingTransactionForUser(userId) {
        return this.transactionRepository.findOne({
            where: {
                user: { id: userId },
                status: 'PENDING',
            },
            relations: ['user', 'brand'],
            order: { createdAt: 'ASC' },
        });
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
        typeorm_2.Repository,
        transaction_validation_service_1.TransactionValidationService,
        transaction_approval_service_1.TransactionApprovalService,
        balance_update_service_1.BalanceUpdateService])
], CoinsService);
