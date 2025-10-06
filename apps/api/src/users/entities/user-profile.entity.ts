import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { User } from './user.entity'

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @OneToOne(() => User, (u) => u.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'varchar', nullable: true })
  firstName!: string | null

  @Column({ type: 'varchar', nullable: true })
  lastName!: string | null
}


