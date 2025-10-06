import { Column, Entity, Index, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'

@Entity('coin_balances')
export class CoinBalance extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index('idx_coin_balance_user_id')
  user!: User

  @Column({ type: 'bigint', default: 0 })
  balance!: string

  @Column({ type: 'bigint', default: 0 })
  totalEarned!: string

  @Column({ type: 'bigint', default: 0 })
  totalRedeemed!: string
}


