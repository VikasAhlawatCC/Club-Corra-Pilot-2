import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity('waitlist_entries')
export class WaitlistEntry extends BaseEntity {
  @Column({ type: 'varchar' })
  email!: string

  @Column({ type: 'varchar', nullable: true })
  source!: string | null

  @Column({ type: 'varchar', default: 'pending', nullable: true })
  status?: string

  @Column({ type: 'text', nullable: true })
  adminNotes?: string | null
}


