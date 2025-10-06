import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { Admin } from './admin.entity'

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @ManyToOne(() => Admin, { onDelete: 'SET NULL', nullable: true })
  actor!: Admin | null

  @Column({ type: 'varchar' })
  action!: string

  @Column({ type: 'jsonb', nullable: true })
  details!: unknown | null
}


