import { Column, Entity, Index, ManyToOne, BeforeInsert, BeforeUpdate } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'
import { Brand } from '../../brands/entities/brand.entity'

export type CoinTransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID' | 'UNPAID' | 'COMPLETED' | 'FAILED'

@Entity('coin_transactions')
export class CoinTransaction extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @Index('idx_coin_tx_user_id')
  user!: User | null

  @ManyToOne(() => Brand, { onDelete: 'SET NULL', nullable: true })
  brand?: Brand | null

  @Column({ type: 'bigint' })
  amount!: string

  @Column({ type: 'varchar' })
  type!: string

  @Column({ type: 'varchar', default: 'PENDING' })
  status!: CoinTransactionStatus

  // New fields for unified reward requests - all as integers for whole numbers only
  @Column({ type: 'int', nullable: true, name: 'bill_amount' })
  billAmount?: number

  @Column({ type: 'int', nullable: true, name: 'coins_earned' })
  coinsEarned?: number

  @Column({ type: 'int', nullable: true, name: 'coins_redeemed' })
  coinsRedeemed?: number

  // Balance tracking fields for reversion on rejection
  // TODO: Add these columns to database via migration
  // @Column({ type: 'int', nullable: true, name: 'previous_balance' })
  // previousBalance?: number

  // @Column({ type: 'int', nullable: true, name: 'balance_after_earn' })
  // balanceAfterEarn?: number

  // @Column({ type: 'int', nullable: true, name: 'balance_after_redeem' })
  // balanceAfterRedeem?: number

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'receipt_url' })
  receiptUrl?: string

  @Column({ type: 'text', nullable: true, name: 'admin_notes' })
  adminNotes?: string

  @Column({ type: 'timestamp', nullable: true, name: 'processed_at' })
  processedAt?: Date

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'transaction_id' })
  transactionId?: string

  @Column({ type: 'date', nullable: true, name: 'bill_date' })
  billDate?: Date

  @Column({ type: 'timestamp', nullable: true, name: 'payment_processed_at' })
  paymentProcessedAt?: Date

  @Column({ type: 'timestamp', nullable: true, name: 'status_updated_at' })
  statusUpdatedAt?: Date

  @BeforeInsert()
  @BeforeUpdate()
  calculateAmount() {
    if (this.coinsEarned !== undefined && this.coinsRedeemed !== undefined) {
      this.amount = (this.coinsEarned - this.coinsRedeemed).toString()
    }
  }
}


