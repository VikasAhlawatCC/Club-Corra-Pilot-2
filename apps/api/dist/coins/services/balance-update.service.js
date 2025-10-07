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
const coin_transaction_entity_1 = require("../entities/coin-transaction.entity");
let BalanceUpdateService = class BalanceUpdateService {
    constructor(balanceRepository, transactionRepository) {
        this.balanceRepository = balanceRepository;
        this.transactionRepository = transactionRepository;
    }
    async updateBalanceForRewardRequest(manager, userId, coinsEarned, coinsToRedeem) {
        let balance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
            where: { user: { id: userId } }
        });
        if (!balance) {
            balance = manager.create(coin_balance_entity_1.CoinBalance, {
                user: { id: userId },
                balance: '0',
                totalEarned: '0',
                totalRedeemed: '0'
            });
        }
        // Update balance with proper tracking of totalEarned and totalRedeemed
        balance.balance = (BigInt(balance.balance) + BigInt(coinsEarned) - BigInt(coinsToRedeem)).toString();
        if (coinsEarned > 0) {
            balance.totalEarned = (BigInt(balance.totalEarned) + BigInt(coinsEarned)).toString();
        }
        if (coinsToRedeem > 0) {
            balance.totalRedeemed = (BigInt(balance.totalRedeemed) + BigInt(coinsToRedeem)).toString();
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
                    balance: '0',
                    totalEarned: '0',
                    totalRedeemed: '0'
                });
            }
            balance.balance = (BigInt(balance.balance) + BigInt(coinsEarned)).toString();
            balance.totalEarned = (BigInt(balance.totalEarned) + BigInt(coinsEarned)).toString();
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
                    balance: '0',
                    totalEarned: '0',
                    totalRedeemed: '0'
                });
            }
            balance.balance = (BigInt(balance.balance) - BigInt(coinsRedeemed)).toString();
            balance.totalRedeemed = (BigInt(balance.totalRedeemed) + BigInt(coinsRedeemed)).toString();
            await manager.save(coin_balance_entity_1.CoinBalance, balance);
        }
    }
    async rollbackBalanceUpdate(manager, userId, amount) {
        await this.updateUserBalance(manager, userId, -amount);
    }
    async getOptimisticBalance(userId, latestTransaction) {
        const balance = await this.getUserBalance(userId);
        const pendingTransactions = await this.getPendingTransactions(userId);
        let optimisticBalance = BigInt(balance.balance);
        // Add back amounts for pending transactions that are NOT the latest one
        for (const pendingTransaction of pendingTransactions) {
            if (pendingTransaction.id !== latestTransaction.id) {
                optimisticBalance += BigInt(pendingTransaction.coinsRedeemed || 0);
                optimisticBalance -= BigInt(pendingTransaction.coinsEarned || 0);
            }
        }
        return optimisticBalance.toString();
    }
    async getUserBalance(userId) {
        let balance = await this.balanceRepository.findOne({
            where: { user: { id: userId } }
        });
        if (!balance) {
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
                balance: transaction.previousBalance || '0',
                totalEarned: '0',
                totalRedeemed: '0'
            });
        }
        else {
            // Revert balance to previous state
            balance.balance = transaction.previousBalance || '0';
            // Revert totalEarned if coins were earned
            if (transaction.coinsEarned && transaction.coinsEarned > 0) {
                balance.totalEarned = (BigInt(balance.totalEarned) - BigInt(transaction.coinsEarned)).toString();
            }
            // Revert totalRedeemed if coins were redeemed
            if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
                balance.totalRedeemed = (BigInt(balance.totalRedeemed) - BigInt(transaction.coinsRedeemed)).toString();
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
                balance: '0'
            });
        }
        const currentBalance = balance.balance;
        balance.balance = (BigInt(currentBalance) + BigInt(amount)).toString();
        await manager.save(coin_balance_entity_1.CoinBalance, balance);
    }
    async getPendingTransactions(userId) {
        return this.transactionRepository.find({
            where: { user: { id: userId }, status: 'PENDING' },
            order: { createdAt: 'ASC' },
        });
    }
};
exports.BalanceUpdateService = BalanceUpdateService;
exports.BalanceUpdateService = BalanceUpdateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coin_balance_entity_1.CoinBalance)),
    __param(1, (0, typeorm_1.InjectRepository)(coin_transaction_entity_1.CoinTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BalanceUpdateService);
