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
exports.TransactionApprovalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coin_transaction_entity_1 = require("../entities/coin-transaction.entity");
const coin_balance_entity_1 = require("../entities/coin-balance.entity");
let TransactionApprovalService = class TransactionApprovalService {
    constructor(transactionRepository, balanceRepository) {
        this.transactionRepository = transactionRepository;
        this.balanceRepository = balanceRepository;
    }
    async approveTransaction(transactionId, approvalDto) {
        return await this.transactionRepository.manager.transaction(async (manager) => {
            const transaction = await manager.findOne(coin_transaction_entity_1.CoinTransaction, {
                where: { id: transactionId },
                relations: ['user', 'brand']
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Transaction not found');
            }
            if (transaction.status !== 'PENDING') {
                throw new common_1.BadRequestException('Transaction is not in pending status');
            }
            // Business Rule: Check if there are older pending transactions for the same user
            if (transaction.user) {
                const olderPendingTransaction = await manager
                    .createQueryBuilder(coin_transaction_entity_1.CoinTransaction, 'tx')
                    .where('tx.userId = :userId', { userId: transaction.user.id })
                    .andWhere('tx.status = :status', { status: 'PENDING' })
                    .andWhere('tx.createdAt < :createdAt', { createdAt: transaction.createdAt })
                    .orderBy('tx.createdAt', 'ASC')
                    .getOne();
                if (olderPendingTransaction) {
                    throw new common_1.BadRequestException(`Cannot approve this transaction. User has an older pending transaction (ID: ${olderPendingTransaction.id}) that must be processed first.`);
                }
            }
            // Enhanced validation: Check if user still has sufficient balance (if redemption involved)
            if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0 && transaction.user) {
                const currentBalance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
                    where: { user: { id: transaction.user.id } }
                });
                if (currentBalance && BigInt(currentBalance.balance) < BigInt(transaction.coinsRedeemed)) {
                    throw new common_1.BadRequestException(`Cannot approve: User balance (${currentBalance.balance}) is less than redemption amount (${transaction.coinsRedeemed})`);
                }
            }
            // Enhanced validation: Recheck that approval won't cause negative balance
            if (transaction.user) {
                const currentBalance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
                    where: { user: { id: transaction.user.id } }
                });
                if (currentBalance) {
                    // Calculate what the balance would be after this transaction
                    const balanceAfterTransaction = currentBalance.balance;
                    // Since balance was already updated at submission, we just need to verify
                    // that the current balance is consistent with the transaction
                    const expectedBalance = transaction.balanceAfterRedeem || transaction.balanceAfterEarn || transaction.previousBalance;
                    const expectedBalanceNum = expectedBalance ? BigInt(expectedBalance) : undefined;
                    if (expectedBalanceNum !== undefined && Math.abs(Number(BigInt(currentBalance.balance) - expectedBalanceNum)) > 0) {
                        throw new common_1.BadRequestException(`Balance inconsistency detected. Current balance (${currentBalance.balance}) doesn't match expected balance (${expectedBalance})`);
                    }
                }
            }
            // Update transaction status based on business rules
            let newStatus;
            if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
                newStatus = 'UNPAID'; // Needs payment processing
            }
            else {
                newStatus = 'PAID'; // No redemption, automatically paid
            }
            transaction.status = newStatus;
            transaction.processedAt = new Date();
            transaction.statusUpdatedAt = new Date();
            if (approvalDto.adminNotes) {
                transaction.adminNotes = approvalDto.adminNotes;
            }
            const updatedTransaction = await manager.save(coin_transaction_entity_1.CoinTransaction, transaction);
            // Note: Balance updates are now handled immediately when transaction is submitted
            // No need to update balance again on approval since it was already updated
            // TODO: Send real-time notification via WebSocket
            // await this.notificationService.notifyUser(transaction.user.id, {
            //   type: 'TRANSACTION_APPROVED',
            //   transaction: updatedTransaction
            // })
            return updatedTransaction;
        });
    }
    async rejectTransaction(transactionId, rejectionDto) {
        return await this.transactionRepository.manager.transaction(async (manager) => {
            const transaction = await manager.findOne(coin_transaction_entity_1.CoinTransaction, {
                where: { id: transactionId },
                relations: ['user', 'brand']
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Transaction not found');
            }
            if (transaction.status !== 'PENDING') {
                throw new common_1.BadRequestException('Transaction is not in pending status');
            }
            // BUSINESS RULE: Revert balance changes when transaction is rejected
            // Only revert if the transaction had balance changes (authenticated user)
            if (transaction.user && transaction.previousBalance !== undefined) {
                // Revert the user's balance back to the previous state with proper tracking
                await this.revertUserBalanceForTransaction(manager, transaction.user.id, transaction);
            }
            // Update transaction status
            transaction.status = 'REJECTED';
            transaction.processedAt = new Date();
            transaction.statusUpdatedAt = new Date();
            transaction.adminNotes = rejectionDto.reason;
            if (rejectionDto.adminNotes) {
                transaction.adminNotes += `\n\nAdmin Notes: ${rejectionDto.adminNotes}`;
            }
            const updatedTransaction = await manager.save(coin_transaction_entity_1.CoinTransaction, transaction);
            // TODO: Send real-time notification via WebSocket
            // await this.notificationService.notifyUser(transaction.user.id, {
            //   type: 'TRANSACTION_REJECTED',
            //   transaction: updatedTransaction
            // })
            return updatedTransaction;
        });
    }
    async markRedeemTransactionAsPaid(transactionId, markPaidDto) {
        return await this.transactionRepository.manager.transaction(async (manager) => {
            const transaction = await manager.findOne(coin_transaction_entity_1.CoinTransaction, {
                where: { id: transactionId },
                relations: ['user', 'brand']
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Transaction not found');
            }
            if (transaction.status !== 'UNPAID') {
                throw new common_1.BadRequestException('Transaction must be in UNPAID status to mark as paid');
            }
            // Enhanced validation: Ensure transaction has redemption amount
            if (!transaction.coinsRedeemed || transaction.coinsRedeemed <= 0) {
                throw new common_1.BadRequestException('Only transactions with redemption amounts can be marked as paid');
            }
            // Enhanced validation: Validate transaction ID format (basic UPI reference validation)
            if (!markPaidDto.transactionId || markPaidDto.transactionId.trim().length < 5) {
                throw new common_1.BadRequestException('Valid transaction ID is required (minimum 5 characters)');
            }
            // Update transaction status
            transaction.status = 'PAID';
            transaction.paymentProcessedAt = new Date();
            transaction.statusUpdatedAt = new Date();
            transaction.transactionId = markPaidDto.transactionId.trim();
            if (markPaidDto.adminNotes) {
                transaction.adminNotes = (transaction.adminNotes || '') + `\n\nPayment Notes: ${markPaidDto.adminNotes}`;
            }
            const updatedTransaction = await manager.save(coin_transaction_entity_1.CoinTransaction, transaction);
            // TODO: Send real-time notification via WebSocket
            // await this.notificationService.notifyUser(transaction.user.id, {
            //   type: 'TRANSACTION_PAID',
            //   transaction: updatedTransaction
            // })
            return updatedTransaction;
        });
    }
    async getPendingTransactions(page = 1, limit = 10) {
        const [transactions, total] = await this.transactionRepository.findAndCount({
            where: { status: 'PENDING' },
            relations: ['user', 'brand'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit
        });
        return {
            transactions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getTransactionStats() {
        const [pending, approved, rejected, processed, paid, totalTransactions, totalCoinsEarned, totalCoinsRedeemed] = await Promise.all([
            this.transactionRepository.count({ where: { status: 'PENDING' } }),
            this.transactionRepository.count({ where: { status: 'APPROVED' } }),
            this.transactionRepository.count({ where: { status: 'REJECTED' } }),
            this.transactionRepository.count({ where: { status: 'PROCESSED' } }),
            this.transactionRepository.count({ where: { status: 'PAID' } }),
            this.transactionRepository.count(),
            this.transactionRepository
                .createQueryBuilder('transaction')
                .select('SUM(transaction.coinsEarned)', 'total')
                .where('transaction.coinsEarned IS NOT NULL')
                .getRawOne()
                .then(result => BigInt(result.total) || BigInt(0)),
            this.transactionRepository
                .createQueryBuilder('transaction')
                .select('SUM(transaction.coinsRedeemed)', 'total')
                .where('transaction.coinsRedeemed IS NOT NULL')
                .getRawOne()
                .then(result => BigInt(result.total) || BigInt(0))
        ]);
        return {
            pending,
            approved,
            rejected,
            processed,
            paid,
            totalTransactions,
            totalCoinsEarned: Number(totalCoinsEarned),
            totalCoinsRedeemed: Number(totalCoinsRedeemed)
        };
    }
    async updateUserBalance(manager, userId, amount) {
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
        balance.balance += amount;
        await manager.save(coin_balance_entity_1.CoinBalance, balance);
    }
    async revertUserBalance(manager, userId, targetBalance) {
        let balance = await manager.findOne(coin_balance_entity_1.CoinBalance, {
            where: { user: { id: userId } }
        });
        if (!balance) {
            balance = manager.create(coin_balance_entity_1.CoinBalance, {
                user: { id: userId },
                balance: targetBalance,
                totalEarned: 0,
                totalRedeemed: 0
            });
        }
        else {
            balance.balance = targetBalance;
        }
        await manager.save(coin_balance_entity_1.CoinBalance, balance);
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
};
exports.TransactionApprovalService = TransactionApprovalService;
exports.TransactionApprovalService = TransactionApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coin_transaction_entity_1.CoinTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(coin_balance_entity_1.CoinBalance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TransactionApprovalService);
