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
exports.PendingTransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pending_transaction_entity_1 = require("../entities/pending-transaction.entity");
const brand_entity_1 = require("../../brands/entities/brand.entity");
let PendingTransactionService = class PendingTransactionService {
    constructor(pendingTransactionRepository, brandRepository) {
        this.pendingTransactionRepository = pendingTransactionRepository;
        this.brandRepository = brandRepository;
    }
    /**
     * Create a pending transaction for unauthenticated users
     */
    async createPendingTransaction(dto) {
        // Validate brand exists
        const brand = await this.brandRepository.findOne({
            where: { id: dto.brandId }
        });
        if (!brand) {
            throw new common_1.BadRequestException('Brand not found');
        }
        // Check if there's an existing unclaimed pending transaction with the same sessionId
        const existing = await this.pendingTransactionRepository.findOne({
            where: {
                sessionId: dto.sessionId,
                claimed: false
            }
        });
        if (existing) {
            // Update existing pending transaction instead of creating a new one
            existing.brandId = dto.brandId;
            existing.billAmount = dto.billAmount;
            existing.receiptUrl = dto.receiptUrl;
            existing.fileName = dto.fileName;
            // Extend expiration by 24 hours
            existing.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const updated = await this.pendingTransactionRepository.save(existing);
            return this.toPendingTransactionResponseDto(updated);
        }
        // Create new pending transaction
        const pendingTransaction = this.pendingTransactionRepository.create({
            sessionId: dto.sessionId,
            brandId: dto.brandId,
            billAmount: dto.billAmount,
            receiptUrl: dto.receiptUrl,
            fileName: dto.fileName,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            claimed: false
        });
        const saved = await this.pendingTransactionRepository.save(pendingTransaction);
        return this.toPendingTransactionResponseDto(saved);
    }
    /**
     * Claim a pending transaction and return its data for creating a real transaction
     */
    async claimPendingTransaction(sessionId, userId) {
        const pendingTransaction = await this.pendingTransactionRepository.findOne({
            where: {
                sessionId,
                claimed: false
            }
        });
        if (!pendingTransaction) {
            // No pending transaction found, return null (not an error)
            return null;
        }
        // Check if expired
        if (pendingTransaction.expiresAt < new Date()) {
            // Delete expired transaction
            await this.pendingTransactionRepository.remove(pendingTransaction);
            return null;
        }
        // Mark as claimed
        pendingTransaction.claimed = true;
        pendingTransaction.claimedBy = userId;
        pendingTransaction.claimedAt = new Date();
        const updated = await this.pendingTransactionRepository.save(pendingTransaction);
        return this.toPendingTransactionResponseDto(updated);
    }
    /**
     * Clean up expired pending transactions
     * Should be called periodically (e.g., via a cron job)
     */
    async cleanupExpiredTransactions() {
        const result = await this.pendingTransactionRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date())
        });
        return result.affected || 0;
    }
    /**
     * Clean up claimed pending transactions older than 7 days
     */
    async cleanupOldClaimedTransactions() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const result = await this.pendingTransactionRepository.delete({
            claimed: true,
            claimedAt: (0, typeorm_2.LessThan)(sevenDaysAgo)
        });
        return result.affected || 0;
    }
    toPendingTransactionResponseDto(entity) {
        return {
            id: entity.id,
            sessionId: entity.sessionId,
            brandId: entity.brandId,
            billAmount: entity.billAmount,
            receiptUrl: entity.receiptUrl,
            fileName: entity.fileName,
            expiresAt: entity.expiresAt,
            claimed: entity.claimed,
            claimedBy: entity.claimedBy,
            claimedAt: entity.claimedAt,
            createdAt: entity.createdAt
        };
    }
};
exports.PendingTransactionService = PendingTransactionService;
exports.PendingTransactionService = PendingTransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pending_transaction_entity_1.PendingTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PendingTransactionService);
