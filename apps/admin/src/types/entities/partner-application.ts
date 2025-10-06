import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PartnershipCategory {
  BEAUTY_WELLNESS = 'Beauty & Wellness',
  FOOD_BEVERAGE = 'Food & Beverage',
  FASHION_APPAREL = 'Fashion & Apparel',
  HOME_LIFESTYLE = 'Home & Lifestyle',
  HEALTH_FITNESS = 'Health & Fitness',
  TECHNOLOGY = 'Technology',
  TRAVEL_HOSPITALITY = 'Travel & Hospitality',
  EDUCATION = 'Education',
  OTHER = 'Other',
}

@Entity('partner_applications')
export class PartnerApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  brandName: string;

  @Column({ 
    type: 'enum', 
    enum: PartnershipCategory,
    default: PartnershipCategory.OTHER 
  })
  category: PartnershipCategory;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  instagram: string;

  @Column({ type: 'varchar', length: 100 })
  contactName: string;

  @Column({ type: 'varchar', length: 100 })
  contactEmail: string;

  @Column({ type: 'text' })
  partnershipReason: string;

  @Column({ type: 'text' })
  excitementFactor: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  source: string; // 'website' or 'mobile' to distinguish submission source

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



