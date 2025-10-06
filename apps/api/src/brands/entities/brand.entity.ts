import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { BrandCategory } from './brand-category.entity'
import { Location } from './location.entity'
import { Offer } from './offer.entity'
import { CoinTransaction } from '../../coins/entities/coin-transaction.entity'

@Entity('brands')
export class Brand extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string

  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 10
  })
  earningPercentage!: number

  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 30
  })
  redemptionPercentage!: number

  @Column({ type: 'int', default: 1 })
  minRedemptionAmount!: number

  @Column({ type: 'int', default: 2000 })
  maxRedemptionAmount!: number

  @Column({ type: 'int', default: 2000 })
  brandwiseMaxCap!: number

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @ManyToOne(() => BrandCategory, category => category.brands, { nullable: true })
  category?: BrandCategory | null

  @OneToMany(() => Location, location => location.brand)
  locations!: Location[]

  @OneToMany(() => Offer, offer => offer.brand)
  offers!: Offer[]

  @OneToMany(() => CoinTransaction, transaction => transaction.brand)
  transactions!: CoinTransaction[]
}


