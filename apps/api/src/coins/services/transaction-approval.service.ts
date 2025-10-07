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

      // Business Rule: Check if there are older pending transactions for the same user
      if (transaction.user) {
        const olderPendingTransaction = await manager
          .createQueryBuilder(CoinTransaction, 'tx')
          .where('tx.userId = :userId', { userId: transaction.user.id })
          .andWhere('tx.status = :status', { status: 'PENDING' })
          .andWhere('tx.createdAt < :createdAt', { createdAt: transaction.createdAt })
          .orderBy('tx.createdAt', 'ASC')
          .getOne()

        if (olderPendingTransaction) {
          throw new BadRequestException(
            `Cannot approve this transaction. User has an older pending transaction (ID: ${olderPendingTransaction.id}) that must be processed first.`
          )
        }
      }

      // Enhanced validation: Check if user still has sufficient balance (if redemption involved)
      if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0 && transaction.user) {
        const currentBalance = await manager.findOne(CoinBalance, {
          where: { user: { id: transaction.user.id } }
        })
        
        if (currentBalance && BigInt(currentBalance.balance) < BigInt(transaction.coinsRedeemed)) {
          throw new BadRequestException(
            `Cannot approve: User balance (${currentBalance.balance}) is less than redemption amount (${transaction.coinsRedeemed})`
          )
        }
      }

      // Enhanced validation: Recheck that approval won't cause negative balance
      if (transaction.user) {
        const currentBalance = await manager.findOne(CoinBalance, {
          where: { user: { id: transaction.user.id } }
        })
        
        if (currentBalance) {
          // Calculate what the balance would be after this transaction
          const balanceAfterTransaction = currentBalance.balance
          
          // Since balance was already updated at submission, we just need to verify
          // that the current balance is consistent with the transaction
          const expectedBalance = transaction.balanceAfterRedeem || transaction.balanceAfterEarn || transaction.previousBalance
          const expectedBalanceNum = expectedBalance ? BigInt(expectedBalance) : undefined
          
          if (expectedBalanceNum !== undefined && Math.abs(Number(BigInt(currentBalance.balance) - expectedBalanceNum)) > 0) {
            throw new BadRequestException(
              `Balance inconsistency detected. Current balance (${currentBalance.balance}) doesn't match expected balance (${expectedBalance})`
            )
          }
        }
      }

      // Update transaction status based on business rules
      let newStatus: string
      if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
        newStatus = 'UNPAID' // Needs payment processing
      } else {
        newStatus = 'PAID' // No redemption, automatically paid
      }

      transaction.status = newStatus as any
      transaction.processedAt = new Date()
      transaction.statusUpdatedAt = new Date()
      if (approvalDto.adminNotes) {
        transaction.adminNotes = approvalDto.adminNotes
      }

      const updatedTransaction = await manager.save(CoinTransaction, transaction)

      // Note: Balance updates are now handled immediately when transaction is submitted
      // No need to update balance again on approval since it was already updated

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

      // BUSINESS RULE: Revert balance changes when transaction is rejected
      // Only revert if the transaction had balance changes (authenticated user)
      if (transaction.user && transaction.previousBalance !== undefined) {
        // Revert the user's balance back to the previous state with proper tracking
        await this.revertUserBalanceForTransaction(manager, transaction.user.id, transaction)
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

      if (transaction.status !== 'UNPAID') {
        throw new BadRequestException('Transaction must be in UNPAID status to mark as paid')
      }

      // Enhanced validation: Ensure transaction has redemption amount
      if (!transaction.coinsRedeemed || transaction.coinsRedeemed <= 0) {
        throw new BadRequestException('Only transactions with redemption amounts can be marked as paid')
      }

      // Enhanced validation: Validate transaction ID format (basic UPI reference validation)
      if (!markPaidDto.transactionId || markPaidDto.transactionId.trim().length < 5) {
        throw new BadRequestException('Valid transaction ID is required (minimum 5 characters)')
      }

      // Update transaction status
      transaction.status = 'PAID'
      transaction.paymentProcessedAt = new Date()
      transaction.statusUpdatedAt = new Date()
      transaction.transactionId = markPaidDto.transactionId.trim()
      if (markPaidDto.adminNotes) {
        transaction.adminNotes = (transaction.adminNotes || '') + `\n\nPayment Notes: ${markPaidDto.adminNotes}`
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
        .then(result => BigInt(result.total) || BigInt(0)),
      this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.coinsRedeemed)', 'total')
        .where('transaction.coinsRedeemed IS NOT NULL')
        .getRawOne()
        .then(result => BigInt(result.total) || BigInt(0))
    ])

    return {
      pending,
      approved,
      rejected,
      processed,
      paid,
      totalTransactions,
      totalCoinsEarned: Number(totalCoinsEarned),
      totalCoinsRedeemed: Number(totalCoinsRedeemed)
    }
  }

  private async updateUserBalance(manager: any, userId: string, amount: number): Promise<void> {
    let balance = await manager.findOne(CoinBalance, {
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = manager.create(CoinBalance, {
        user: { id: userId } as User,
        balance: 0,
        totalEarned: 0,
        totalRedeemed: 0
      })
    }

    balance.balance += amount
    await manager.save(CoinBalance, balance)
  }

  private async revertUserBalance(manager: any, userId: string, targetBalance: number): Promise<void> {
    let balance = await manager.findOne(CoinBalance, {
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = manager.create(CoinBalance, {
        user: { id: userId } as User,
        balance: targetBalance,
        totalEarned: 0,
        totalRedeemed: 0
      })
    } else {
      balance.balance = targetBalance
    }

    await manager.save(CoinBalance, balance)
  }

  /**
   * Revert user balance for a specific transaction with proper tracking of totalEarned and totalRedeemed
   * This method is used when a transaction is rejected and we need to revert the balance changes
   */
  private async revertUserBalanceForTransaction(manager: any, userId: string, transaction: CoinTransaction): Promise<void> {
    let balance = await manager.findOne(CoinBalance, {
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = manager.create(CoinBalance, {
        user: { id: userId } as User,
        balance: transaction.previousBalance || 0,
        totalEarned: 0,
        totalRedeemed: 0
      })
    } else {
      // Revert balance to previous state
      balance.balance = transaction.previousBalance || 0
      
      // Revert totalEarned if coins were earned
      if (transaction.coinsEarned && transaction.coinsEarned > 0) {
        balance.totalEarned = Math.max(0, balance.totalEarned - transaction.coinsEarned)
      }
      
      // Revert totalRedeemed if coins were redeemed
      if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
        balance.totalRedeemed = Math.max(0, balance.totalRedeemed - transaction.coinsRedeemed)
      }
    }

    await manager.save(CoinBalance, balance)
  }
}
