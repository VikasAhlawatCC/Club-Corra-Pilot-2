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
    const netAmount = coinsEarned - coinsRedeemed
    
    if (netAmount !== 0) {
      await this.updateUserBalance(manager, userId, netAmount)
    }
  }

  async updateBalanceForEarnRequest(manager: any, userId: string, coinsEarned: number): Promise<void> {
    if (coinsEarned > 0) {
      await this.updateUserBalance(manager, userId, coinsEarned)
    }
  }

  async updateBalanceForRedeemRequest(manager: any, userId: string, coinsRedeemed: number): Promise<void> {
    if (coinsRedeemed > 0) {
      await this.updateUserBalance(manager, userId, -coinsRedeemed)
    }
  }

  async rollbackBalanceUpdate(manager: any, userId: string, amount: number): Promise<void> {
    await this.updateUserBalance(manager, userId, -amount)
  }

  async getOptimisticBalance(userId: string, pendingTransaction: CoinTransaction): Promise<number> {
    const balance = await this.getUserBalance(userId)
    const currentBalance = parseInt(balance.balance)
    
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
        balance: '0'
      })
      await this.balanceRepository.save(balance)
    }

    return balance
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
