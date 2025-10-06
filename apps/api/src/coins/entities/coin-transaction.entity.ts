import { Column, Entity, Index, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'
import { Brand } from '../../brands/entities/brand.entity'

export type CoinTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

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
}


