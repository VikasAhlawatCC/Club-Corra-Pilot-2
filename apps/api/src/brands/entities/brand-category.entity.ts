import { Column, Entity, OneToMany } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { Brand } from './brand.entity'

@Entity('brand_categories')
export class BrandCategory extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'varchar', nullable: true })
  description?: string

  @Column({ type: 'varchar', nullable: true })
  icon?: string

  @Column({ type: 'varchar', nullable: true })
  color?: string

  @OneToMany(() => Brand, brand => brand.category)
  brands!: Brand[]
}


