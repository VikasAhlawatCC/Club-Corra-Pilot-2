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
exports.BalanceUpdateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coin_balance_entity_1 = require("../entities/coin-balance.entity");
let BalanceUpdateService = class BalanceUpdateService {
    constructor(balanceRepository) {
        this.balanceRepository = balanceRepository;
    }
    async updateBalanceForRewardRequest(manager, userId, coinsEarned, coinsRedeemed) {
        let balance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
            where: { user: { id: userId } }
        });
        if (!balance) {
            balance = manager.create(coin_balance_entity_1.CoinBalance, {
                user: { id: userId },
                balance: 0,
                totalEarned: 0,
                totalRedeemed: 0
            });
        }
        // Update balance: add earned coins, subtract redeemed coins
        balance.balance += coinsEarned - coinsRedeemed;
        // Track totalEarned and totalRedeemed separately
        if (coinsEarned > 0) {
            balance.totalEarned += coinsEarned;
        }
        if (coinsRedeemed > 0) {
            balance.totalRedeemed += coinsRedeemed;
        }
        await manager.save(coin_balance_entity_1.CoinBalance, balance);
    }
    async updateBalanceForEarnRequest(manager, userId, coinsEarned) {
        if (coinsEarned > 0) {
            let balance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
                where: { user: { id: userId } }
            });
            if (!balance) {
                balance = manager.create(coin_balance_entity_1.CoinBalance, {
                    user: { id: userId },
                    balance: 0,
                    totalEarned: 0,
                    totalRedeemed: 0
                });
            }
            balance.balance += coinsEarned;
            balance.totalEarned += coinsEarned;
            await manager.save(coin_balance_entity_1.CoinBalance, balance);
        }
    }
    async updateBalanceForRedeemRequest(manager, userId, coinsRedeemed) {
        if (coinsRedeemed > 0) {
            let balance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
                where: { user: { id: userId } }
            });
            if (!balance) {
                balance = manager.create(coin_balance_entity_1.CoinBalance, {
                    user: { id: userId },
                    balance: 0,
                    totalEarned: 0,
                    totalRedeemed: 0
                });
            }
            balance.balance -= coinsRedeemed;
            balance.totalRedeemed += coinsRedeemed;
            await manager.save(coin_balance_entity_1.CoinBalance, balance);
        }
    }
    async rollbackBalanceUpdate(manager, userId, amount) {
        await this.updateUserBalance(manager, userId, -amount);
    }
    async getOptimisticBalance(userId, pendingTransaction) {
        const balance = await this.getUserBalance(userId);
        const currentBalance = balance.balance;
        // Calculate optimistic balance based on pending transaction
        let optimisticBalance = currentBalance;
        if (pendingTransaction.coinsEarned) {
            optimisticBalance += pendingTransaction.coinsEarned;
        }
        if (pendingTransaction.coinsRedeemed) {
            optimisticBalance -= pendingTransaction.coinsRedeemed;
        }
        return optimisticBalance;
    }
    async getUserBalance(userId) {
        let balance = await this.balanceRepository.findOne({
            where: { user: { id: userId } }
        });
        if (!balance) {
            balance = this.balanceRepository.create({
                user: { id: userId },
                balance: 0,
                totalEarned: 0,
                totalRedeemed: 0
            });
            await this.balanceRepository.save(balance);
        }
        return balance;
    }
    /**
     * Revert user balance for a specific transaction with proper tracking of totalEarned and totalRedeemed
     * This method is used when a transaction is rejected and we need to revert the balance changes
     */
    async revertUserBalanceForTransaction(manager, userId, transaction) {
        let balance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
            where: { user: { id: userId } }
        });
        if (!balance) {
            balance = manager.create(coin_balance_entity_1.CoinBalance, {
                user: { id: userId },
                balance: transaction.previousBalance || 0,
                totalEarned: 0,
                totalRedeemed: 0
            });
        }
        else {
            // Revert balance to previous state
            balance.balance = transaction.previousBalance || 0;
            // Revert totalEarned if coins were earned
            if (transaction.coinsEarned && transaction.coinsEarned > 0) {
                balance.totalEarned = Math.max(0, balance.totalEarned - transaction.coinsEarned);
            }
            // Revert totalRedeemed if coins were redeemed
            if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
                balance.totalRedeemed = Math.max(0, balance.totalRedeemed - transaction.coinsRedeemed);
            }
        }
        await manager.save(coin_balance_entity_1.CoinBalance, balance);
    }
    async updateUserBalance(manager, userId, amount) {
        let balance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
            where: { user: { id: userId } }
        });
        if (!balance) {
            balance = manager.create(coin_balance_entity_1.CoinBalance, {
                user: { id: userId },
                balance: 0
            });
        }
        const currentBalance = balance.balance;
        balance.balance = currentBalance + amount;
        await manager.save(coin_balance_entity_1.CoinBalance, balance);
    }
};
exports.BalanceUpdateService = BalanceUpdateService;
exports.BalanceUpdateService = BalanceUpdateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coin_balance_entity_1.CoinBalance)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BalanceUpdateService);
