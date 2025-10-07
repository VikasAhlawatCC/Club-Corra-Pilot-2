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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_profile_entity_1 = require("./entities/user-profile.entity");
const payment_details_entity_1 = require("./entities/payment-details.entity");
const auth_provider_entity_1 = require("./entities/auth-provider.entity");
const coin_balance_entity_1 = require("../coins/entities/coin-balance.entity");
const coin_transaction_entity_1 = require("../coins/entities/coin-transaction.entity");
let UsersService = class UsersService {
    constructor(userRepository, userProfileRepository, paymentDetailsRepository, authProviderRepository, coinBalanceRepository, coinTransactionRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.paymentDetailsRepository = paymentDetailsRepository;
        this.authProviderRepository = authProviderRepository;
        this.coinBalanceRepository = coinBalanceRepository;
        this.coinTransactionRepository = coinTransactionRepository;
    }
    async findAll(page = 1, limit = 20, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const queryBuilder = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.profile', 'profile')
                .leftJoinAndSelect('user.paymentDetails', 'paymentDetails')
                .leftJoinAndSelect('user.coinBalance', 'coinBalance')
                .orderBy('user.createdAt', 'DESC')
                .skip(skip)
                .take(limit);
            if (filters.status) {
                queryBuilder.andWhere('user.status = :status', { status: filters.status });
            }
            if (filters.search) {
                queryBuilder.andWhere('(user.mobileNumber ILIKE :search OR user.email ILIKE :search OR profile.firstName ILIKE :search OR profile.lastName ILIKE :search)', { search: `%${filters.search}%` });
            }
            if (filters.isMobileVerified !== undefined) {
                queryBuilder.andWhere('user.isMobileVerified = :isMobileVerified', { isMobileVerified: filters.isMobileVerified });
            }
            if (filters.isEmailVerified !== undefined) {
                queryBuilder.andWhere('user.isEmailVerified = :isEmailVerified', { isEmailVerified: filters.isEmailVerified });
            }
            const [users, total] = await queryBuilder.getManyAndCount();
            // Add coin balance information to each user
            const usersWithCoins = await Promise.all(users.map(async (user) => {
                const totalTransactions = await this.coinTransactionRepository.count({
                    where: { user: { id: user.id } },
                });
                return {
                    ...user,
                    totalCoins: user.coinBalance ? parseFloat(user.coinBalance.balance.toString()) : 0,
                    totalEarned: user.coinBalance ? parseFloat(user.coinBalance.totalEarned.toString()) : 0,
                    totalRedeemed: user.coinBalance ? parseFloat(user.coinBalance.totalRedeemed.toString()) : 0,
                    totalTransactions,
                };
            }));
            return {
                data: usersWithCoins,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }
    async findById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['profile', 'paymentDetails', 'authProviders', 'coinBalance'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByMobileNumber(mobileNumber) {
        return this.userRepository.findOne({
            where: { mobileNumber },
            relations: ['profile', 'paymentDetails', 'authProviders', 'coinBalance'],
        });
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email },
            relations: ['profile', 'paymentDetails', 'authProviders', 'coinBalance'],
        });
    }
    async updateUserStatus(id, status) {
        const user = await this.findById(id);
        user.status = status;
        return this.userRepository.save(user);
    }
    async updateProfile(id, profileData) {
        const user = await this.findById(id);
        if (!user.profile) {
            // Create profile if it doesn't exist
            const profile = this.userProfileRepository.create({
                ...profileData,
                user: { id },
            });
            return this.userProfileRepository.save(profile);
        }
        Object.assign(user.profile, profileData);
        return this.userProfileRepository.save(user.profile);
    }
    async updateEmail(id, email) {
        // Check if email already exists
        const existingUser = await this.findByEmail(email);
        if (existingUser && existingUser.id !== id) {
            throw new common_1.ConflictException('Email already registered');
        }
        const user = await this.findById(id);
        user.email = email;
        user.isEmailVerified = false; // Reset verification status
        return this.userRepository.save(user);
    }
    async updatePaymentDetails(id, paymentData) {
        const user = await this.findById(id);
        if (!user.paymentDetails) {
            // Create payment details if they don't exist
            const paymentDetails = this.paymentDetailsRepository.create({
                ...paymentData,
                user: { id },
            });
            return this.paymentDetailsRepository.save(paymentDetails);
        }
        Object.assign(user.paymentDetails, paymentData);
        return this.paymentDetailsRepository.save(user.paymentDetails);
    }
    async getUserCount() {
        try {
            return await this.userRepository.count();
        }
        catch (error) {
            console.error('Error getting user count:', error);
            throw error;
        }
    }
    async getUserStats() {
        const [totalUsers, activeUsers, pendingUsers, suspendedUsers, mobileVerifiedUsers, emailVerifiedUsers,] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { status: user_entity_1.UserStatus.ACTIVE } }),
            this.userRepository.count({ where: { status: user_entity_1.UserStatus.PENDING } }),
            this.userRepository.count({ where: { status: user_entity_1.UserStatus.SUSPENDED } }),
            this.userRepository.count({ where: { isMobileVerified: true } }),
            this.userRepository.count({ where: { isEmailVerified: true } }),
        ]);
        // Calculate total coins across all users
        const totalCoinsResult = await this.coinBalanceRepository
            .createQueryBuilder('coinBalance')
            .select('SUM(CAST(coinBalance.balance AS DECIMAL))', 'totalCoins')
            .getRawOne();
        const totalCoins = totalCoinsResult?.totalCoins || 0;
        return {
            totalUsers,
            activeUsers,
            pendingUsers,
            suspendedUsers,
            mobileVerifiedUsers,
            emailVerifiedUsers,
            totalCoins: parseFloat(totalCoins.toString()),
        };
    }
    async getUserTransactionHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await this.coinTransactionRepository.findAndCount({
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
    async getUserBalance(userId) {
        return this.coinBalanceRepository.findOne({
            where: { user: { id: userId } },
        });
    }
    async getUserActivity(userId) {
        const user = await this.findById(userId);
        const balance = await this.getUserBalance(userId);
        const recentTransactions = await this.coinTransactionRepository.find({
            where: { user: { id: userId } },
            relations: ['brand'],
            order: { createdAt: 'DESC' },
            take: 5,
        });
        return {
            user,
            balance,
            recentTransactions,
        };
    }
    async searchUsers(query, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('(user.mobileNumber ILIKE :query OR user.email ILIKE :query OR profile.firstName ILIKE :query OR profile.lastName ILIKE :query)', { query: `%${query}%` })
            .orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getUsersByStatus(status, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await this.userRepository.findAndCount({
            where: { status },
            relations: ['profile', 'paymentDetails'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getNewUsers(days = 30, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [users, total] = await this.userRepository.findAndCount({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(startDate),
            },
            relations: ['profile'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getUserGrowthStats(days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [totalUsers, newUsers, activeUsers, growthRate,] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({
                where: {
                    createdAt: (0, typeorm_2.MoreThanOrEqual)(startDate),
                },
            }),
            this.userRepository.count({
                where: { status: user_entity_1.UserStatus.ACTIVE },
            }),
            this.calculateGrowthRate(startDate, endDate),
        ]);
        return {
            totalUsers,
            newUsers,
            activeUsers,
            growthRate,
            period: `${days} days`,
        };
    }
    async calculateGrowthRate(startDate, endDate) {
        const midPoint = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
        const [firstHalf, secondHalf] = await Promise.all([
            this.userRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(startDate, midPoint),
                },
            }),
            this.userRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(midPoint, endDate),
                },
            }),
        ]);
        if (firstHalf === 0)
            return secondHalf > 0 ? 100 : 0;
        return ((secondHalf - firstHalf) / firstHalf) * 100;
    }
    async exportUsers(filters = {}) {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.paymentDetails', 'paymentDetails')
            .orderBy('user.createdAt', 'DESC');
        if (filters.status) {
            queryBuilder.andWhere('user.status = :status', { status: filters.status });
        }
        if (filters.startDate) {
            queryBuilder.andWhere('user.createdAt >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            queryBuilder.andWhere('user.createdAt <= :endDate', { endDate: filters.endDate });
        }
        return queryBuilder.getMany();
    }
    async createUser(userData) {
        // Check if user already exists
        const existingUser = await this.findByMobileNumber(userData.mobileNumber);
        if (existingUser) {
            throw new common_1.ConflictException('User with this mobile number already exists');
        }
        if (userData.email) {
            const existingEmailUser = await this.findByEmail(userData.email);
            if (existingEmailUser) {
                throw new common_1.ConflictException('User with this email already exists');
            }
        }
        // Create user
        const user = this.userRepository.create({
            mobileNumber: userData.mobileNumber,
            email: userData.email,
            status: user_entity_1.UserStatus.PENDING,
            isMobileVerified: false,
            isEmailVerified: false,
        });
        const savedUser = await this.userRepository.save(user);
        // Create user profile
        const profile = this.userProfileRepository.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            user: { id: savedUser.id },
        });
        await this.userProfileRepository.save(profile);
        // Create coin balance
        const coinBalance = this.coinBalanceRepository.create({
            balance: '0',
            totalEarned: '0',
            totalRedeemed: '0',
            user: { id: savedUser.id },
        });
        await this.coinBalanceRepository.save(coinBalance);
        // Return user with relations
        return this.findById(savedUser.id);
    }
    async createCoinBalanceForUser(userId) {
        // Check if coin balance already exists
        const existingBalance = await this.coinBalanceRepository.findOne({
            where: { user: { id: userId } },
        });
        if (existingBalance) {
            return existingBalance;
        }
        // Create new coin balance
        const coinBalance = this.coinBalanceRepository.create({
            balance: '0',
            totalEarned: '0',
            totalRedeemed: '0',
            user: { id: userId },
        });
        return this.coinBalanceRepository.save(coinBalance);
    }
    async adjustUserCoins(userId, adjustment) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let coinBalance = await this.getUserBalance(userId);
        if (!coinBalance) {
            // Create coin balance if it doesn't exist
            coinBalance = this.coinBalanceRepository.create({
                balance: '0',
                totalEarned: '0',
                totalRedeemed: '0',
                user: { id: userId },
            });
            coinBalance = await this.coinBalanceRepository.save(coinBalance);
        }
        const oldBalance = coinBalance.balance;
        let newBalance;
        if (adjustment.newBalance !== undefined) {
            newBalance = String(adjustment.newBalance);
        }
        else if (adjustment.delta !== undefined) {
            newBalance = (BigInt(oldBalance) + BigInt(adjustment.delta)).toString();
        }
        else {
            throw new common_1.BadRequestException('Either newBalance or delta must be provided');
        }
        // Update coin balance
        coinBalance.balance = newBalance;
        await this.coinBalanceRepository.save(coinBalance);
        // Create transaction record
        const transaction = this.coinTransactionRepository.create({
            type: BigInt(newBalance) > BigInt(oldBalance) ? 'EARN' : 'REDEEM',
            amount: (BigInt(newBalance) - BigInt(oldBalance)).toString(),
            status: 'COMPLETED',
            user: { id: userId },
        });
        await this.coinTransactionRepository.save(transaction);
        return {
            oldBalance,
            newBalance,
            delta: (BigInt(newBalance) - BigInt(oldBalance)).toString(),
            reason: adjustment.reason,
        };
    }
    async deleteUser(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Soft delete by updating status to DELETED
        user.status = user_entity_1.UserStatus.DELETED;
        await this.userRepository.save(user);
        return {
            success: true,
            message: 'User deleted successfully',
            data: { userId, deletedAt: new Date() }
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_details_entity_1.PaymentDetails)),
    __param(3, (0, typeorm_1.InjectRepository)(auth_provider_entity_1.AuthProviderLink)),
    __param(4, (0, typeorm_1.InjectRepository)(coin_balance_entity_1.CoinBalance)),
    __param(5, (0, typeorm_1.InjectRepository)(coin_transaction_entity_1.CoinTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
