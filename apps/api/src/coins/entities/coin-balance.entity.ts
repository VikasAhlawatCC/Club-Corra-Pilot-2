import { Column, Entity, Index, ManyToOne, OneToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'

@Entity('coin_balances')
export class CoinBalance extends BaseEntity {
  @OneToOne(() => User, user => user.coinBalance, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User

  @Column({ type: 'bigint', default: 0 })
  balance!: string

  @Column({ type: 'bigint', default: 0, name: 'total_earned' })
  totalEarned!: string

  @Column({ type: 'bigint', default: 0, name: 'total_redeemed' })
  totalRedeemed!: string
}


