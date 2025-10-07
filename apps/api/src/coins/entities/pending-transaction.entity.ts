import { Entity, Column, Index } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity('pending_transactions')
export class PendingTransaction extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  @Index('idx_pending_tx_session_id')
  sessionId!: string

  @Column({ type: 'uuid' })
  brandId!: string

  @Column({ type: 'int' })
  billAmount!: number

  @Column({ type: 'varchar', length: 500 })
  receiptUrl!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName?: string

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  expiresAt!: Date

  @Column({ type: 'boolean', default: false })
  claimed!: boolean

  @Column({ type: 'uuid', nullable: true })
  @Index('idx_pending_tx_claimed_by')
  claimedBy?: string

  @Column({ type: 'timestamptz', nullable: true })
  claimedAt?: Date
}

