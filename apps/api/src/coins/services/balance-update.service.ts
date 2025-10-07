import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CoinBalance } from '../entities/coin-balance.entity'
import { CoinTransaction } from '../entities/coin-transaction.entity'
import { User } from '../../users/entities/user.entity'

@Injectable()
export class BalanceUpdateService {
  constructor(
    @InjectRepository(CoinBalance)
    private balanceRepository: Repository<CoinBalance>,
    @InjectRepository(CoinTransaction)
    private transactionRepository: Repository<CoinTransaction>,
  ) {}

  async updateBalanceForRewardRequest(
    manager: any,
    userId: string,
    coinsEarned: number,
    coinsToRedeem: number
  ): Promise<void> {
    let balance = await manager.findOne(CoinBalance, {
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = manager.create(CoinBalance, {
        user: { id: userId } as User,
        balance: '0',
        totalEarned: '0',
        totalRedeemed: '0'
      })
    }

    // Update balance with proper tracking of totalEarned and totalRedeemed
    balance.balance = (BigInt(balance.balance) + BigInt(coinsEarned) - BigInt(coinsToRedeem)).toString();
    if (coinsEarned > 0) {
      balance.totalEarned = (BigInt(balance.totalEarned) + BigInt(coinsEarned)).toString();
    }
    if (coinsToRedeem > 0) {
      balance.totalRedeemed = (BigInt(balance.totalRedeemed) + BigInt(coinsToRedeem)).toString();
    }

    await manager.save(CoinBalance, balance);
  }

  async updateBalanceForEarnRequest(manager: any, userId: string, coinsEarned: number): Promise<void> {
    if (coinsEarned > 0) {
      let balance = await manager.findOne(CoinBalance, {
        where: { user: { id: userId } }
      })

      if (!balance) {
        balance = manager.create(CoinBalance, {
          user: { id: userId } as User,
          balance: '0',
          totalEarned: '0',
          totalRedeemed: '0'
        })
      }

      balance.balance = (BigInt(balance.balance) + BigInt(coinsEarned)).toString()
      balance.totalEarned = (BigInt(balance.totalEarned) + BigInt(coinsEarned)).toString()
      await manager.save(CoinBalance, balance)
    }
  }

  async updateBalanceForRedeemRequest(manager: any, userId: string, coinsRedeemed: number): Promise<void> {
    if (coinsRedeemed > 0) {
      let balance = await manager.findOne(CoinBalance, {
        where: { user: { id: userId } }
      })

      if (!balance) {
        balance = manager.create(CoinBalance, {
          user: { id: userId } as User,
          balance: '0',
          totalEarned: '0',
          totalRedeemed: '0'
        })
      }

      balance.balance = (BigInt(balance.balance) - BigInt(coinsRedeemed)).toString()
      balance.totalRedeemed = (BigInt(balance.totalRedeemed) + BigInt(coinsRedeemed)).toString()
      await manager.save(CoinBalance, balance)
    }
  }

  async rollbackBalanceUpdate(manager: any, userId: string, amount: number): Promise<void> {
    await this.updateUserBalance(manager, userId, -amount)
  }

  async getOptimisticBalance(userId: string, latestTransaction: CoinTransaction): Promise<string> {
    const balance = await this.getUserBalance(userId)
    const pendingTransactions = await this.getPendingTransactions(userId)

    let optimisticBalance = BigInt(balance.balance)

    // Add back amounts for pending transactions that are NOT the latest one
    for (const pendingTransaction of pendingTransactions) {
      if (pendingTransaction.id !== latestTransaction.id) {
        optimisticBalance += BigInt(pendingTransaction.coinsRedeemed || 0)
        optimisticBalance -= BigInt(pendingTransaction.coinsEarned || 0)
      }
    }

    return optimisticBalance.toString()
  }

  async getUserBalance(userId: string): Promise<CoinBalance> {
    let balance = await this.balanceRepository.findOne({
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = this.balanceRepository.create({
        user: { id: userId } as User,
        balance: '0',
        totalEarned: '0',
        totalRedeemed: '0'
      })
      await this.balanceRepository.save(balance)
    }

    return balance
  }

  /**
   * Revert user balance for a specific transaction with proper tracking of totalEarned and totalRedeemed
   * This method is used when a transaction is rejected and we need to revert the balance changes
   */
  async revertUserBalanceForTransaction(manager: any, userId: string, transaction: CoinTransaction): Promise<void> {
    let balance = await manager.findOne(CoinBalance, {
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = manager.create(CoinBalance, {
        user: { id: userId } as User,
        balance: transaction.previousBalance || '0',
        totalEarned: '0',
        totalRedeemed: '0'
      })
    } else {
      // Revert balance to previous state
      balance.balance = transaction.previousBalance || '0'
      
      // Revert totalEarned if coins were earned
      if (transaction.coinsEarned && transaction.coinsEarned > 0) {
        balance.totalEarned = (BigInt(balance.totalEarned) - BigInt(transaction.coinsEarned)).toString()
      }
      
      // Revert totalRedeemed if coins were redeemed
      if (transaction.coinsRedeemed && transaction.coinsRedeemed > 0) {
        balance.totalRedeemed = (BigInt(balance.totalRedeemed) - BigInt(transaction.coinsRedeemed)).toString()
      }
    }

    await manager.save(CoinBalance, balance)
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

    const currentBalance = balance.balance
    balance.balance = (BigInt(currentBalance) + BigInt(amount)).toString()
    await manager.save(CoinBalance, balance)
  }

  private async getPendingTransactions(userId: string): Promise<CoinTransaction[]> {
    return this.transactionRepository.find({
      where: { user: { id: userId }, status: 'PENDING' },
      order: { createdAt: 'ASC' },
    });
  }
}
