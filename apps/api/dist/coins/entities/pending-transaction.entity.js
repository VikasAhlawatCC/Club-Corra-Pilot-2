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
exports.PendingTransaction = void 0;
const typeorm_1 = require("typeorm");
let PendingTransaction = class PendingTransaction {
};
exports.PendingTransaction = PendingTransaction;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', primary: true, generated: 'uuid' }),
    __metadata("design:type", String)
], PendingTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, name: 'session_id' }),
    (0, typeorm_1.Index)('idx_pending_tx_session_id'),
    __metadata("design:type", String)
], PendingTransaction.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'brand_id' }),
    __metadata("design:type", String)
], PendingTransaction.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'bill_amount' }),
    __metadata("design:type", Number)
], PendingTransaction.prototype, "billAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, name: 'receipt_url' }),
    __metadata("design:type", String)
], PendingTransaction.prototype, "receiptUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'file_name' }),
    __metadata("design:type", String)
], PendingTransaction.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'expires_at' }),
    __metadata("design:type", Date)
], PendingTransaction.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PendingTransaction.prototype, "claimed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'claimed_by' }),
    (0, typeorm_1.Index)('idx_pending_tx_claimed_by'),
    __metadata("design:type", String)
], PendingTransaction.prototype, "claimedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'claimed_at' }),
    __metadata("design:type", Date)
], PendingTransaction.prototype, "claimedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', name: 'created_at' }),
    __metadata("design:type", Date)
], PendingTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', name: 'updated_at' }),
    __metadata("design:type", Date)
], PendingTransaction.prototype, "updatedAt", void 0);
exports.PendingTransaction = PendingTransaction = __decorate([
    (0, typeorm_1.Entity)('pending_transactions')
], PendingTransaction);
