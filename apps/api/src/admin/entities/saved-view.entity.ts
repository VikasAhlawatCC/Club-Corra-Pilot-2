import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { Admin } from './admin.entity'

@Entity('saved_views')
export class SavedView extends BaseEntity {
  @ManyToOne(() => Admin, { onDelete: 'SET NULL', nullable: true })
  owner!: Admin | null

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'jsonb' })
  config!: unknown
}


