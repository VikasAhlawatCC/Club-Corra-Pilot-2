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
        const { brandId, billAmount, billDate, coinsToRedeem = 0, upiId } = createRewardRequestDto;
        // 1. Validate user exists
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // 2. Validate brand exists and is active
        const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } });
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found or inactive');
        }
        // 3. Validate bill amount (whole numbers only)
        if (!Number.isInteger(billAmount) || billAmount < 1 || billAmount > 100000) {
            throw new common_1.BadRequestException('Bill amount must be a whole number between 1 and 100,000');
        }
        // 4. Validate bill date (not future, not too old - max 30 days)
        const billDateObj = new Date(billDate);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (billDateObj > now) {
            throw new common_1.BadRequestException('Bill date cannot be in the future');
        }
        if (billDateObj < thirtyDaysAgo) {
            throw new common_1.BadRequestException('Bill date cannot be older than 30 days');
        }
        // 5. Check for duplicate submissions (same user, brand, bill amount, and date)
        await this.validateNoDuplicateTransaction(userId, brandId, billAmount, billDateObj);
        // 6. Get current balance for validation
        const currentBalance = await this.getUserBalance(userId);
        // 7. Validate redemption amount and limits
        if (coinsToRedeem > 0) {
            // Check sufficient balance for redemption
            await this.validateSufficientBalance(userId, coinsToRedeem);
            // Check brand redemption limits
            await this.validateBrandRedemptionLimits(brandId, billAmount, coinsToRedeem);
            // Validate UPI ID format
            this.validateUpiId(upiId || '');
        }
        // 8. Calculate expected earning and validate
        const netBillAmount = billAmount - coinsToRedeem;
        const coinsEarned = Math.max(1, Math.round((netBillAmount * brand.earningPercentage) / 100));
        // Check brand earning limits
        await this.validateBrandEarningLimits(brandId, coinsEarned);
        // 9. Validate that final balance won't be negative
        await this.validateNoNegativeBalance(userId, coinsEarned, coinsToRedeem);
        // 10. Additional validation: Ensure net bill amount is positive after redemption
        if (netBillAmount <= 0) {
            throw new common_1.BadRequestException('Redemption amount cannot exceed bill amount');
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
        if (BigInt(balance.balance) < BigInt(coinsToRedeem)) {
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
        const userBalance = BigInt(balance.balance);
        if (userBalance <= 0n) {
            return false;
        }
        // Check if brand allows redemption
        if (!brand.isActive) {
            return false;
        }
        return true;
    }
    /**
     * Validate that a user has sufficient balance for redemption
     */
    async validateSufficientBalance(userId, coinsToRedeem) {
        const balance = await this.getUserBalance(userId);
        if (BigInt(balance.balance) < BigInt(coinsToRedeem)) {
            throw new common_1.BadRequestException(`Insufficient balance. You have ${balance.balance} coins but trying to redeem ${coinsToRedeem} coins`);
        }
    }
    /**
     * Validate that a transaction won't result in negative balance
     */
    async validateNoNegativeBalance(userId, coinsEarned, coinsRedeemed) {
        const balance = await this.getUserBalance(userId);
        const finalBalance = BigInt(balance.balance) + BigInt(coinsEarned) - BigInt(coinsRedeemed);
        if (finalBalance < 0n) {
            throw new common_1.BadRequestException('Transaction would result in negative balance');
        }
    }
    /**
     * Validate brand earning limits
     */
    async validateBrandEarningLimits(brandId, coinsEarned) {
        const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } });
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found or inactive');
        }
        if (brand.maxEarningPerTransaction && coinsEarned > brand.maxEarningPerTransaction) {
            throw new common_1.BadRequestException(`Maximum earning for ${brand.name} is ${brand.maxEarningPerTransaction} coins per transaction`);
        }
    }
    /**
     * Validate brand redemption limits
     */
    async validateBrandRedemptionLimits(brandId, billAmount, coinsToRedeem) {
        const brand = await this.brandRepository.findOne({ where: { id: brandId, isActive: true } });
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found or inactive');
        }
        // Check brand redemption percentage limit
        const maxRedeemableByPercentage = Math.round((billAmount * brand.redemptionPercentage) / 100);
        if (coinsToRedeem > maxRedeemableByPercentage) {
            throw new common_1.BadRequestException(`Maximum redemption for ${brand.name} is ${maxRedeemableByPercentage} coins (${brand.redemptionPercentage}% of bill amount)`);
        }
        // Check brand redemption per-transaction limit
        if (brand.maxRedemptionPerTransaction && coinsToRedeem > brand.maxRedemptionPerTransaction) {
            throw new common_1.BadRequestException(`Maximum redemption for ${brand.name} is ${brand.maxRedemptionPerTransaction} coins per transaction`);
        }
        // Check brand minimum redemption amount
        if (brand.minRedemptionAmount && coinsToRedeem < brand.minRedemptionAmount) {
            throw new common_1.BadRequestException(`Minimum redemption for ${brand.name} is ${brand.minRedemptionAmount} coins`);
        }
        // Check brand maximum redemption amount
        if (brand.maxRedemptionAmount && coinsToRedeem > brand.maxRedemptionAmount) {
            throw new common_1.BadRequestException(`Maximum redemption for ${brand.name} is ${brand.maxRedemptionAmount} coins`);
        }
    }
    /**
     * Validate UPI ID format (basic validation)
     */
    validateUpiId(upiId) {
        if (!upiId || upiId.trim().length === 0) {
            throw new common_1.BadRequestException('UPI ID is required when redeeming coins');
        }
        // Basic UPI ID format validation (should contain @ and be reasonable length)
        const trimmedUpiId = upiId.trim();
        if (!trimmedUpiId.includes('@') || trimmedUpiId.length < 5 || trimmedUpiId.length > 50) {
            throw new common_1.BadRequestException('Invalid UPI ID format. Please provide a valid UPI ID');
        }
    }
    /**
     * Check for duplicate transactions
     */
    async validateNoDuplicateTransaction(userId, brandId, billAmount, billDate) {
        const existingTransaction = await this.transactionRepository.findOne({
            where: {
                user: { id: userId },
                brand: { id: brandId },
                billAmount: billAmount,
                billDate: billDate,
                status: 'PENDING'
            }
        });
        if (existingTransaction) {
            throw new common_1.BadRequestException('A pending reward request already exists for this bill');
        }
    }
    async getUserBalance(userId) {
        let balance = await this.balanceRepository.findOne({ where: { user: { id: userId } } });
        if (!balance) {
            // Create balance if it doesn't exist
            balance = this.balanceRepository.create({
                user: { id: userId },
                balance: '0',
                totalEarned: '0',
                totalRedeemed: '0'
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
