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
exports.CoinBalance = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let CoinBalance = class CoinBalance extends base_entity_1.BaseEntity {
};
exports.CoinBalance = CoinBalance;
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.coinBalance, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], CoinBalance.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", String)
], CoinBalance.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0, name: 'total_earned' }),
    __metadata("design:type", String)
], CoinBalance.prototype, "totalEarned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0, name: 'total_redeemed' }),
    __metadata("design:type", String)
], CoinBalance.prototype, "totalRedeemed", void 0);
exports.CoinBalance = CoinBalance = __decorate([
    (0, typeorm_1.Entity)('coin_balances')
], CoinBalance);
