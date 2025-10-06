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
    constructor(transactionRepository, balanceRepository, dataSource) {
        this.transactionRepository = transactionRepository;
        this.balanceRepository = balanceRepository;
        this.dataSource = dataSource;
    }
    async approveTransaction(transactionId, approvalDto) {
        return await this.dataSource.transaction(async (manager) => {
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
            // Update transaction status
            transaction.status = 'APPROVED';
            transaction.processedAt = new Date();
            transaction.statusUpdatedAt = new Date();
            if (approvalDto.adminNotes) {
                transaction.adminNotes = approvalDto.adminNotes;
            }
            const updatedTransaction = await manager.save(coin_transaction_entity_1.CoinTransaction, transaction);
            // Update user balance if coins were earned
            if (transaction.coinsEarned && transaction.coinsEarned > 0 && transaction.user) {
                await this.updateUserBalance(manager, transaction.user.id, transaction.coinsEarned);
            }
            // TODO: Send real-time notification via WebSocket
            // await this.notificationService.notifyUser(transaction.user.id, {
            //   type: 'TRANSACTION_APPROVED',
            //   transaction: updatedTransaction
            // })
            return updatedTransaction;
        });
    }
    async rejectTransaction(transactionId, rejectionDto) {
        return await this.dataSource.transaction(async (manager) => {
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
        return await this.dataSource.transaction(async (manager) => {
            const transaction = await manager.findOne(coin_transaction_entity_1.CoinTransaction, {
                where: { id: transactionId },
                relations: ['user', 'brand']
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Transaction not found');
            }
            if (transaction.status !== 'APPROVED') {
                throw new common_1.BadRequestException('Transaction must be approved before marking as paid');
            }
            // Update transaction status
            transaction.status = 'PAID';
            transaction.paymentProcessedAt = new Date();
            transaction.statusUpdatedAt = new Date();
            transaction.transactionId = markPaidDto.transactionId;
            if (markPaidDto.adminNotes) {
                transaction.adminNotes = markPaidDto.adminNotes;
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
                .then(result => parseInt(result.total) || 0),
            this.transactionRepository
                .createQueryBuilder('transaction')
                .select('SUM(transaction.coinsRedeemed)', 'total')
                .where('transaction.coinsRedeemed IS NOT NULL')
                .getRawOne()
                .then(result => parseInt(result.total) || 0)
        ]);
        return {
            pending,
            approved,
            rejected,
            processed,
            paid,
            totalTransactions,
            totalCoinsEarned,
            totalCoinsRedeemed
        };
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
        const currentBalance = parseInt(balance.balance);
        balance.balance = (currentBalance + amount).toString();
        await manager.save(coin_balance_entity_1.CoinBalance, balance);
    }
};
exports.TransactionApprovalService = TransactionApprovalService;
exports.TransactionApprovalService = TransactionApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coin_transaction_entity_1.CoinTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(coin_balance_entity_1.CoinBalance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], TransactionApprovalService);
