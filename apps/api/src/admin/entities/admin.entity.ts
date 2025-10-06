import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN'
export type AdminStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

@Entity('admins')
export class Admin extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  email!: string

  @Column({ type: 'varchar' })
  passwordHash!: string

  @Column({ type: 'varchar', nullable: true })
  firstName?: string

  @Column({ type: 'varchar', nullable: true })
  lastName?: string

  @Column({ type: 'varchar', default: 'ADMIN' })
  role!: AdminRole

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status!: AdminStatus

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash?: string

  @Column({ type: 'text', nullable: true })
  permissions?: string
}


