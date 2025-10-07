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
    private readonly balanceRepository: Repository<CoinBalance>,
  ) {}

  async updateBalanceForRewardRequest(
    manager: any,
    userId: string,
    coinsEarned: number,
    coinsRedeemed: number
  ): Promise<void> {
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

    // Update balance: add earned coins, subtract redeemed coins
    balance.balance += coinsEarned - coinsRedeemed
    
    // Track totalEarned and totalRedeemed separately
    if (coinsEarned > 0) {
      balance.totalEarned += coinsEarned
    }
    if (coinsRedeemed > 0) {
      balance.totalRedeemed += coinsRedeemed
    }

    await manager.save(CoinBalance, balance)
  }

  async updateBalanceForEarnRequest(manager: any, userId: string, coinsEarned: number): Promise<void> {
    if (coinsEarned > 0) {
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

      balance.balance += coinsEarned
      balance.totalEarned += coinsEarned
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
          balance: 0,
          totalEarned: 0,
          totalRedeemed: 0
        })
      }

      balance.balance -= coinsRedeemed
      balance.totalRedeemed += coinsRedeemed
      await manager.save(CoinBalance, balance)
    }
  }

  async rollbackBalanceUpdate(manager: any, userId: string, amount: number): Promise<void> {
    await this.updateUserBalance(manager, userId, -amount)
  }

  async getOptimisticBalance(userId: string, pendingTransaction: CoinTransaction): Promise<number> {
    const balance = await this.getUserBalance(userId)
    const currentBalance = balance.balance
    
    // Calculate optimistic balance based on pending transaction
    let optimisticBalance = currentBalance
    
    if (pendingTransaction.coinsEarned) {
      optimisticBalance += pendingTransaction.coinsEarned
    }
    
    if (pendingTransaction.coinsRedeemed) {
      optimisticBalance -= pendingTransaction.coinsRedeemed
    }
    
    return optimisticBalance
  }

  async getUserBalance(userId: string): Promise<CoinBalance> {
    let balance = await this.balanceRepository.findOne({
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = this.balanceRepository.create({
        user: { id: userId } as User,
        balance: 0,
        totalEarned: 0,
        totalRedeemed: 0
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

  private async updateUserBalance(manager: any, userId: string, amount: number): Promise<void> {
    let balance = await manager.findOne(CoinBalance, {
      where: { user: { id: userId } }
    })

    if (!balance) {
      balance = manager.create(CoinBalance, {
        user: { id: userId } as User,
        balance: 0
      })
    }

    const currentBalance = balance.balance
    balance.balance = currentBalance + amount
    await manager.save(CoinBalance, balance)
  }
}
