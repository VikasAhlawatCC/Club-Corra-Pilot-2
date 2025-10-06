import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from '../../users/entities/user.entity'

@Entity('risk_signals')
export class RiskSignal extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User

  @Column({ type: 'varchar' })
  signal!: string

  @Column({ type: 'jsonb', nullable: true })
  metadata!: unknown | null
}


