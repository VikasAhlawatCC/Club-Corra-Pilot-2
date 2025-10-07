import { Entity, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('pending_transactions')
export class PendingTransaction {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id!: string

  @Column({ type: 'varchar', length: 100, name: 'session_id' })
  @Index('idx_pending_tx_session_id')
  sessionId!: string

  @Column({ type: 'uuid', name: 'brand_id' })
  brandId!: string

  @Column({ type: 'int', name: 'bill_amount' })
  billAmount!: number

  @Column({ type: 'varchar', length: 500, name: 'receipt_url' })
  receiptUrl!: string

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'file_name' })
  fileName?: string

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'expires_at' })
  expiresAt!: Date

  @Column({ type: 'boolean', default: false })
  claimed!: boolean

  @Column({ type: 'uuid', nullable: true, name: 'claimed_by' })
  @Index('idx_pending_tx_claimed_by')
  claimedBy?: string

  @Column({ type: 'timestamptz', nullable: true, name: 'claimed_at' })
  claimedAt?: Date

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date
}

