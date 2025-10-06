import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CoinTransaction } from '../entities/coin-transaction.entity'
import { CoinBalance } from '../entities/coin-balance.entity'
import { User } from '../../users/entities/user.entity'
import { TransactionApprovalDto, TransactionRejectionDto, MarkAsPaidDto } from '../dto/reward-request-response.dto'

@Injectable()
export class TransactionApprovalService {
  constructor(
    @InjectRepository(CoinTransaction)
    private readonly transactionRepository: Repository<CoinTransaction>,
    @InjectRepository(CoinBalance)
    private readonly balanceRepository: Repository<CoinBalance>,
  ) {}

  async approveTransaction(transactionId: string, approvalDto: TransactionApprovalDto): Promise<CoinTransaction> {
    return await this.transactionRepository.manager.transaction(async (manager) => {
      const transaction = await manager.findOne(CoinTransaction, {
        where: { id: transactionId },
        relations: ['user', 'brand']
      })

      if (!transaction) {
        throw new NotFoundException('Transaction not found')
      }

      if (transaction.status !== 'PENDING') {
        throw new BadRequestException('Transaction is not in pending status')
      }

      // Update transaction status
      transaction.status = 'APPROVED'
      transaction.processedAt = new Date()
      transaction.statusUpdatedAt = new Date()
      if (approvalDto.adminNotes) {
        transaction.adminNotes = approvalDto.adminNotes
      }

      const updatedTransaction = await manager.save(CoinTransaction, transaction)

      // Update user balance if coins were earned
      if (transaction.coinsEarned && transaction.coinsEarned > 0 && transaction.user) {
        await this.updateUserBalance(manager, transaction.user.id, transaction.coinsEarned)
      }

      // TODO: Send real-time notification via WebSocket
      // await this.notificationService.notifyUser(transaction.user.id, {
      //   type: 'TRANSACTION_APPROVED',
      //   transaction: updatedTransaction
      // })

      return updatedTransaction
    })
  }

  async rejectTransaction(transactionId: string, rejectionDto: TransactionRejectionDto): Promise<CoinTransaction> {
    return await this.transactionRepository.manager.transaction(async (manager) => {
      const transaction = await manager.findOne(CoinTransaction, {
        where: { id: transactionId },
        relations: ['user', 'brand']
      })

      if (!transaction) {
        throw new NotFoundException('Transaction not found')
      }

      if (transaction.status !== 'PENDING') {
        throw new BadRequestException('Transaction is not in pending status')
      }

      // Update transaction status
      transaction.status = 'REJECTED'
      transaction.processedAt = new Date()
      transaction.statusUpdatedAt = new Date()
      transaction.adminNotes = rejectionDto.reason
      if (rejectionDto.adminNotes) {
        transaction.adminNotes += `\n\nAdmin Notes: ${rejectionDto.adminNotes}`
      }

      const updatedTransaction = await manager.save(CoinTransaction, transaction)

      // TODO: Send real-time notification via WebSocket
      // await this.notificationService.notifyUser(transaction.user.id, {
      //   type: 'TRANSACTION_REJECTED',
      //   transaction: updatedTransaction
      // })

      return updatedTransaction
    })
  }

  async markRedeemTransactionAsPaid(transactionId: string, markPaidDto: MarkAsPaidDto): Promise<CoinTransaction> {
    return await this.transactionRepository.manager.transaction(async (manager) => {
      const transaction = await manager.findOne(CoinTransaction, {
        where: { id: transactionId },
        relations: ['user', 'brand']
      })

      if (!transaction) {
        throw new NotFoundException('Transaction not found')
      }

      if (transaction.status !== 'APPROVED') {
        throw new BadRequestException('Transaction must be approved before marking as paid')
      }

      // Update transaction status
      transaction.status = 'PAID'
      transaction.paymentProcessedAt = new Date()
      transaction.statusUpdatedAt = new Date()
      transaction.transactionId = markPaidDto.transactionId
      if (markPaidDto.adminNotes) {
        transaction.adminNotes = markPaidDto.adminNotes
      }

      const updatedTransaction = await manager.save(CoinTransaction, transaction)

      // TODO: Send real-time notification via WebSocket
      // await this.notificationService.notifyUser(transaction.user.id, {
      //   type: 'TRANSACTION_PAID',
      //   transaction: updatedTransaction
      // })

      return updatedTransaction
    })
  }

  async getPendingTransactions(page: number = 1, limit: number = 10): Promise<{
    transactions: CoinTransaction[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { status: 'PENDING' },
      relations: ['user', 'brand'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    })

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getTransactionStats(): Promise<{
    pending: number
    approved: number
    rejected: number
    processed: number
    paid: number
    totalTransactions: number
    totalCoinsEarned: number
    totalCoinsRedeemed: number
  }> {
    const [
      pending,
      approved,
      rejected,
      processed,
      paid,
      totalTransactions,
      totalCoinsEarned,
      totalCoinsRedeemed
    ] = await Promise.all([
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
    ])

    return {
      pending,
      approved,
      rejected,
      processed,
      paid,
      totalTransactions,
      totalCoinsEarned,
      totalCoinsRedeemed
    }
  }

  private async updateUserBalance(manager: any, userId: string, amount: number): Promise<void> {
    let balance = await manager.findOne(CoinBalance, {
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = manager.create(CoinBalance, {
        user: { id: userId } as User,
        balance: '0'
      })
    }

    const currentBalance = parseInt(balance.balance)
    balance.balance = (currentBalance + amount).toString()
    await manager.save(CoinBalance, balance)
  }
}
