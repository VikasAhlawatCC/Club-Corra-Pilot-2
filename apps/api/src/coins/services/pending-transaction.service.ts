import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan } from 'typeorm'
import { PendingTransaction } from '../entities/pending-transaction.entity'
import { CreatePendingTransactionDto } from '../dto/create-pending-transaction.dto'
import { PendingTransactionResponseDto } from '../dto/pending-transaction-response.dto'
import { Brand } from '../../brands/entities/brand.entity'

@Injectable()
export class PendingTransactionService {
  constructor(
    @InjectRepository(PendingTransaction)
    private readonly pendingTransactionRepository: Repository<PendingTransaction>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>
  ) {}

  /**
   * Create a pending transaction for unauthenticated users
   */
  async createPendingTransaction(
    dto: CreatePendingTransactionDto
  ): Promise<PendingTransactionResponseDto> {
    // Validate brand exists
    const brand = await this.brandRepository.findOne({
      where: { id: dto.brandId }
    })

    if (!brand) {
      throw new BadRequestException('Brand not found')
    }

    // Check if there's an existing unclaimed pending transaction with the same sessionId
    const existing = await this.pendingTransactionRepository.findOne({
      where: {
        sessionId: dto.sessionId,
        claimed: false
      }
    })

    if (existing) {
      // Update existing pending transaction instead of creating a new one
      existing.brandId = dto.brandId
      existing.billAmount = dto.billAmount
      existing.receiptUrl = dto.receiptUrl
      existing.fileName = dto.fileName
      // Extend expiration by 24 hours
      existing.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      
      const updated = await this.pendingTransactionRepository.save(existing)
      return this.toPendingTransactionResponseDto(updated)
    }

    // Create new pending transaction
    const pendingTransaction = this.pendingTransactionRepository.create({
      sessionId: dto.sessionId,
      brandId: dto.brandId,
      billAmount: dto.billAmount,
      receiptUrl: dto.receiptUrl,
      fileName: dto.fileName,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      claimed: false
    })

    const saved = await this.pendingTransactionRepository.save(pendingTransaction)
    return this.toPendingTransactionResponseDto(saved)
  }

  /**
   * Claim a pending transaction and return its data for creating a real transaction
   */
  async claimPendingTransaction(
    sessionId: string,
    userId: string
  ): Promise<PendingTransactionResponseDto | null> {
    const pendingTransaction = await this.pendingTransactionRepository.findOne({
      where: {
        sessionId,
        claimed: false
      }
    })

    if (!pendingTransaction) {
      // No pending transaction found, return null (not an error)
      return null
    }

    // Check if expired
    if (pendingTransaction.expiresAt < new Date()) {
      // Delete expired transaction
      await this.pendingTransactionRepository.remove(pendingTransaction)
      return null
    }

    // Mark as claimed
    pendingTransaction.claimed = true
    pendingTransaction.claimedBy = userId
    pendingTransaction.claimedAt = new Date()

    const updated = await this.pendingTransactionRepository.save(pendingTransaction)
    return this.toPendingTransactionResponseDto(updated)
  }

  /**
   * Clean up expired pending transactions
   * Should be called periodically (e.g., via a cron job)
   */
  async cleanupExpiredTransactions(): Promise<number> {
    const result = await this.pendingTransactionRepository.delete({
      expiresAt: LessThan(new Date())
    })

    return result.affected || 0
  }

  /**
   * Clean up claimed pending transactions older than 7 days
   */
  async cleanupOldClaimedTransactions(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const result = await this.pendingTransactionRepository.delete({
      claimed: true,
      claimedAt: LessThan(sevenDaysAgo)
    })

    return result.affected || 0
  }

  private toPendingTransactionResponseDto(
    entity: PendingTransaction
  ): PendingTransactionResponseDto {
    return {
      id: entity.id,
      sessionId: entity.sessionId,
      brandId: entity.brandId,
      billAmount: entity.billAmount,
      receiptUrl: entity.receiptUrl,
      fileName: entity.fileName,
      expiresAt: entity.expiresAt,
      claimed: entity.claimed,
      claimedBy: entity.claimedBy,
      claimedAt: entity.claimedAt,
      createdAt: entity.createdAt
    }
  }
}

