import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity('partner_applications')
export class PartnerApplication extends BaseEntity {
  @Column({ type: 'varchar' })
  companyName!: string

  @Column({ type: 'varchar' })
  contactEmail!: string

  @Column({ type: 'jsonb', nullable: true })
  details!: unknown | null

  @Column({ type: 'varchar', default: 'pending' })
  status!: string

  @Column({ type: 'text', nullable: true })
  adminNotes!: string | null
}


