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

  // New fields for unified reward requests
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  billAmount?: number

  @Column({ type: 'int', nullable: true })
  coinsEarned?: number

  @Column({ type: 'int', nullable: true })
  coinsRedeemed?: number

  @Column({ type: 'varchar', length: 500, nullable: true })
  receiptUrl?: string

  @Column({ type: 'text', nullable: true })
  adminNotes?: string

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId?: string

  @Column({ type: 'date', nullable: true })
  billDate?: Date

  @Column({ type: 'timestamp', nullable: true })
  paymentProcessedAt?: Date

  @Column({ type: 'timestamp', nullable: true })
  statusUpdatedAt?: Date

  @BeforeInsert()
  @BeforeUpdate()
  calculateAmount() {
    if (this.coinsEarned !== undefined && this.coinsRedeemed !== undefined) {
      this.amount = (this.coinsEarned - this.coinsRedeemed).toString()
    }
  }
}


