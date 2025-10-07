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
exports.CoinTransaction = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const brand_entity_1 = require("../../brands/entities/brand.entity");
let CoinTransaction = class CoinTransaction extends base_entity_1.BaseEntity {
    calculateAmount() {
        if (this.coinsEarned !== undefined && this.coinsRedeemed !== undefined) {
            this.amount = (this.coinsEarned - this.coinsRedeemed).toString();
        }
    }
};
exports.CoinTransaction = CoinTransaction;
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.Index)('idx_coin_tx_user_id'),
    __metadata("design:type", Object)
], CoinTransaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => brand_entity_1.Brand, { onDelete: 'SET NULL', nullable: true }),
    __metadata("design:type", Object)
], CoinTransaction.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", String)
], CoinTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], CoinTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'PENDING' }),
    __metadata("design:type", String)
], CoinTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'bill_amount' }),
    __metadata("design:type", Number)
], CoinTransaction.prototype, "billAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'coins_earned' }),
    __metadata("design:type", Number)
], CoinTransaction.prototype, "coinsEarned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'coins_redeemed' }),
    __metadata("design:type", Number)
], CoinTransaction.prototype, "coinsRedeemed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'previous_balance' }),
    __metadata("design:type", Number)
], CoinTransaction.prototype, "previousBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'balance_after_earn' }),
    __metadata("design:type", Number)
], CoinTransaction.prototype, "balanceAfterEarn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'balance_after_redeem' }),
    __metadata("design:type", Number)
], CoinTransaction.prototype, "balanceAfterRedeem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true, name: 'receipt_url' }),
    __metadata("design:type", String)
], CoinTransaction.prototype, "receiptUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'admin_notes' }),
    __metadata("design:type", String)
], CoinTransaction.prototype, "adminNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'processed_at' }),
    __metadata("design:type", Date)
], CoinTransaction.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, name: 'transaction_id' }),
    __metadata("design:type", String)
], CoinTransaction.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, name: 'bill_date' }),
    __metadata("design:type", Date)
], CoinTransaction.prototype, "billDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'payment_processed_at' }),
    __metadata("design:type", Date)
], CoinTransaction.prototype, "paymentProcessedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'status_updated_at' }),
    __metadata("design:type", Date)
], CoinTransaction.prototype, "statusUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CoinTransaction.prototype, "calculateAmount", null);
exports.CoinTransaction = CoinTransaction = __decorate([
    (0, typeorm_1.Entity)('coin_transactions')
], CoinTransaction);
