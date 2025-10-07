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
exports.TransactionValidationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coin_transaction_entity_1 = require("../entities/coin-transaction.entity");
const brand_entity_1 = require("../../brands/entities/brand.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const coin_balance_entity_1 = require("../entities/coin-balance.entity");
let TransactionValidationService = class TransactionValidationService {
    constructor(transactionRepository, brandRepository, userRepository, balanceRepository) {
        this.transactionRepository = transactionRepository;
        this.brandRepository = brandRepository;
        this.userRepository = userRepository;
        this.balanceRepository = balanceRepository;
    }
    async validateRewardRequest(userId, createRewardRequestDto) {
        const { brandId, billAmount, billDate, coinsToRedeem = 0 } = createRewardRequestDto;
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
        // Validate bill amount limits (whole numbers only)
        if (!Number.isInteger(billAmount) || billAmount < 1 || billAmount > 100000) {
            throw new common_1.BadRequestException('Bill amount must be a whole number between 1 and 100,000');
        }
        // Validate bill date (not future, not too old - max 30 days)
        const billDateObj = new Date(billDate);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (billDateObj > now) {
            throw new common_1.BadRequestException('Bill date cannot be in the future');
        }
        if (billDateObj < thirtyDaysAgo) {
            throw new common_1.BadRequestException('Bill date cannot be older than 30 days');
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
        });
        if (existingTransaction) {
            throw new common_1.BadRequestException('A pending reward request already exists for this bill');
        }
        // Check for recent submissions (prevent spam - max 1 per hour)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentTransaction = await this.transactionRepository.findOne({
            where: {
                user: { id: userId },
                brand: { id: brandId },
                createdAt: (0, typeorm_2.Between)(oneHourAgo, now)
            }
        });
        if (recentTransaction) {
            throw new common_1.BadRequestException('Please wait at least 1 hour before submitting another request for this brand');
        }
        // Validate redemption amount
        if (coinsToRedeem > 0) {
            const balance = await this.getUserBalance(userId);
            if (balance.balance < coinsToRedeem) {
                throw new common_1.BadRequestException('Insufficient coin balance for redemption');
            }
            // Check brand redemption limits
            if (brand.maxRedemptionPerTransaction && coinsToRedeem > brand.maxRedemptionPerTransaction) {
                throw new common_1.BadRequestException(`Maximum redemption amount for this brand is ${brand.maxRedemptionPerTransaction} coins`);
            }
        }
        // Check brand earning caps
        if (brand.maxEarningPerTransaction) {
            const netBillAmount = billAmount - coinsToRedeem;
            const potentialEarning = Math.round((netBillAmount * brand.earningPercentage) / 100);
            if (potentialEarning > brand.maxEarningPerTransaction) {
                throw new common_1.BadRequestException(`Maximum earning amount for this brand is ${brand.maxEarningPerTransaction} coins`);
            }
        }
    }
    async validateEarnRequest(userId, brandId, billAmount) {
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
        // Validate bill amount
        if (billAmount < 0.01 || billAmount > 100000) {
            throw new common_1.BadRequestException('Bill amount must be between $0.01 and $100,000');
        }
        // Check brand earning caps
        if (brand.maxEarningPerTransaction) {
            const potentialEarning = Math.round((billAmount * brand.earningPercentage) / 100);
            if (potentialEarning > brand.maxEarningPerTransaction) {
                throw new common_1.BadRequestException(`Maximum earning amount for this brand is ${brand.maxEarningPerTransaction} coins`);
            }
        }
    }
    async validateRedeemRequest(userId, brandId, coinsToRedeem) {
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
        // Validate redemption amount
        if (coinsToRedeem <= 0) {
            throw new common_1.BadRequestException('Redemption amount must be greater than 0');
        }
        const balance = await this.getUserBalance(userId);
        if (balance.balance < coinsToRedeem) {
            throw new common_1.BadRequestException('Insufficient coin balance for redemption');
        }
        // Check brand redemption limits
        if (brand.maxRedemptionPerTransaction && coinsToRedeem > brand.maxRedemptionPerTransaction) {
            throw new common_1.BadRequestException(`Maximum redemption amount for this brand is ${brand.maxRedemptionPerTransaction} coins`);
        }
    }
    async hasPendingEarnRequests(userId, brandId) {
        const pendingTransaction = await this.transactionRepository.findOne({
            where: {
                user: { id: userId },
                brand: { id: brandId },
                status: 'PENDING',
                type: 'EARN'
            }
        });
        return !!pendingTransaction;
    }
    async canProcessRedeemRequest(userId, brandId) {
        const balance = await this.getUserBalance(userId);
        const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } });
        if (!brand) {
            return false;
        }
        // Check if user has sufficient balance
        const userBalance = balance.balance;
        if (userBalance <= 0) {
            return false;
        }
        // Check if brand allows redemption
        if (!brand.isActive) {
            return false;
        }
        return true;
    }
    async getUserBalance(userId) {
        let balance = await this.balanceRepository.findOne({ where: { user: { id: userId } } });
        if (!balance) {
            // Create balance if it doesn't exist
            balance = this.balanceRepository.create({
                user: { id: userId },
                balance: 0
            });
            await this.balanceRepository.save(balance);
        }
        return balance;
    }
};
exports.TransactionValidationService = TransactionValidationService;
exports.TransactionValidationService = TransactionValidationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coin_transaction_entity_1.CoinTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(coin_balance_entity_1.CoinBalance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TransactionValidationService);
