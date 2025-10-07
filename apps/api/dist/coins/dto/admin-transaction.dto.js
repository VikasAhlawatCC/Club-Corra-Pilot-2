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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTransactionDto = void 0;
exports.convertToAdminTransactionDto = convertToAdminTransactionDto;
const class_validator_1 = require("class-validator");
class AdminTransactionDto {
}
exports.AdminTransactionDto = AdminTransactionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "userName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "userMobile", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['EARN', 'REDEEM', 'WELCOME_BONUS', 'ADJUSTMENT', 'REWARD_REQUEST']),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED', 'PAID', 'UNPAID', 'COMPLETED', 'FAILED']),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "brandName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "brandId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionDto.prototype, "billAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "adminNotes", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], AdminTransactionDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], AdminTransactionDto.prototype, "updatedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionDto.prototype, "coinsEarned", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionDto.prototype, "coinsRedeemed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], AdminTransactionDto.prototype, "billDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], AdminTransactionDto.prototype, "processedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], AdminTransactionDto.prototype, "paymentProcessedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], AdminTransactionDto.prototype, "statusUpdatedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AdminTransactionDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionDto.prototype, "userBalance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Boolean)
], AdminTransactionDto.prototype, "isOldestPending", void 0);
/**
 * Converts a CoinTransaction entity to AdminTransactionDto
 * Handles the conversion of amount from string to number
 */
function convertToAdminTransactionDto(transaction) {
    return {
        id: transaction.id,
        userId: transaction.user?.id || 'unknown',
        userName: transaction.user?.mobileNumber || 'Unknown User',
        userMobile: transaction.user?.mobileNumber || 'Unknown',
        type: transaction.type,
        amount: parseInt(transaction.amount) || 0, // Convert string to number
        status: transaction.status,
        brandName: transaction.brand?.name,
        brandId: transaction.brand?.id,
        billAmount: transaction.billAmount,
        receiptUrl: transaction.receiptUrl,
        adminNotes: transaction.adminNotes,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        coinsEarned: transaction.coinsEarned,
        coinsRedeemed: transaction.coinsRedeemed,
        billDate: transaction.billDate,
        transactionId: transaction.transactionId,
        processedAt: transaction.processedAt,
        paymentProcessedAt: transaction.paymentProcessedAt,
        statusUpdatedAt: transaction.statusUpdatedAt,
        brand: transaction.brand ? {
            id: transaction.brand.id,
            name: transaction.brand.name,
            logoUrl: transaction.brand.logoUrl,
            description: transaction.brand.description,
        } : undefined,
        userBalance: undefined, // This would need to be populated separately
        isOldestPending: undefined, // This would need to be calculated separately
    };
}
