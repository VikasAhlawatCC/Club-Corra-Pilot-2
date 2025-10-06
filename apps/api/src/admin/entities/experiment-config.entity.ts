import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity('experiment_configs')
export class ExperimentConfig extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  key!: string

  @Column({ type: 'jsonb' })
  value!: unknown
}


