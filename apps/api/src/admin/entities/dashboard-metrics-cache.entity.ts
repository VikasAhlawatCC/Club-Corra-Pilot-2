import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity('dashboard_metrics_cache')
export class DashboardMetricsCache extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  key!: string

  @Column({ type: 'jsonb' })
  value!: unknown

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null
}


