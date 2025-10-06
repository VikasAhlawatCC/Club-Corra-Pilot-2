import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum City {
  DELHI_NCR = 'Delhi NCR',
  MUMBAI = 'Mumbai',
  BENGALURU = 'Bengaluru',
  HYDERABAD = 'Hyderabad',
  OTHER = 'Other',
}

export enum LifeSituation {
  LIVING_SOLO = 'Living solo',
  CAREER_FOCUSED = 'Career-focused',
  PET_OWNER = 'Pet owner',
  NEW_HOME = 'New home',
  LIVING_WITH_FAMILY = 'Living with family',
  RECENTLY_MARRIED = 'Recently married',
  HEALTH_FITNESS_FOCUSED = 'Health & fitness focused',
  EXPECTING_HAVE_BABY = 'Expecting/have baby',
  SETTLED_LIFESTYLE = 'Settled lifestyle',
}

export enum CategoryType {
  NUTRITION_WELLNESS = 'Nutrition & Wellness',
  YOGA_FITNESS_SUBSCRIPTIONS = 'Yoga / Fitness Subscriptions',
  SALON_SPA_SERVICES = 'Salon or Spa Services',
  GROCERIES = 'Groceries',
  RESTAURANTS = 'Restaurants',
  TRAVEL_STAYCATIONS = 'Travel / Staycations',
  EXPERIENCES = 'Experiences',
  FINANCIAL_PRODUCTS = 'Financial Products',
  SKINCARE_BEAUTY = 'Skincare & Beauty',
  ELECTRONICS_GADGETS = 'Electronics / Gadgets',
}

export enum ExpenseRange {
  UNDER_1000 = 'Under ₹1,000',
  RANGE_1000_2500 = '₹1,000 - ₹2,500',
  RANGE_2500_5000 = '₹2,500 - ₹5,000',
  RANGE_5000_10000 = '₹5,000 - ₹10,000',
  ABOVE_10000 = 'Above ₹10,000',
}

export enum Frequency {
  ALMOST_DAILY = 'Almost daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  EVERY_2_3_MONTHS = 'Every 2-3 months',
  OCCASIONALLY = 'Occasionally',
  RARELY = 'Rarely',
}

export enum Differentiator {
  QUALITY = 'Quality',
  PRICE = 'Price',
  CONVENIENCE = 'Convenience',
  BRAND_REPUTATION = 'Brand reputation',
  CUSTOMER_SERVICE = 'Customer service',
  INNOVATION = 'Innovation',
  SUSTAINABILITY = 'Sustainability',
  LOCAL_SUPPORT = 'Local support',
  PERSONALIZATION = 'Personalization',
  REWARDS_PROGRAM = 'Rewards program',
}

export enum LoyaltyProgram {
  YES_USE_OFTEN = 'Yes, I use it often',
  YES_BUT_FORGET = 'Yes, but I forget about it',
  NO_NEVER_TRIED = 'No, never tried',
}

export enum LoyaltyValue {
  CASHBACK = 'Cashback',
  DISCOUNTS = 'Discounts',
  EXCLUSIVE_ACCESS = 'Exclusive access',
  POINTS_REDEMPTION = 'Points redemption',
  FREE_SHIPPING = 'Free shipping',
  EARLY_ACCESS = 'Early access to sales',
  BIRTHDAY_REWARDS = 'Birthday rewards',
  VIP_TREATMENT = 'VIP treatment',
  REFERRAL_BONUSES = 'Referral bonuses',
  GAMIFICATION = 'Gamification',
}

export enum EarlyAccess {
  YES_INTERESTED = 'Yes, I\'m interested!',
  MAYBE_DISCUSS = 'Maybe, let\'s discuss',
  NOT_INTERESTED = 'Not interested',
}

@Entity('waitlist_entries')
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  age: string;

  @Column({ 
    type: 'enum', 
    enum: Gender 
  })
  gender: Gender;

  @Column({ 
    type: 'enum', 
    enum: City 
  })
  city: City;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cityOther: string;

  @Column({ type: 'enum', enum: LifeSituation, array: true, nullable: true })
  lifeSituations: LifeSituation[];

  @Column({ type: 'jsonb', nullable: true })
  categories: Array<{
    category: CategoryType;
    brands?: string;
    expense?: ExpenseRange;
    frequency?: Frequency;
    differentiators?: Differentiator[];
  }>;

  @Column({ 
    type: 'enum', 
    enum: LoyaltyProgram 
  })
  loyaltyProgram: LoyaltyProgram;

  @Column({ type: 'enum', enum: LoyaltyValue, array: true, nullable: true })
  loyaltyValue: LoyaltyValue[];

  @Column({ 
    type: 'enum', 
    enum: EarlyAccess 
  })
  earlyAccess: EarlyAccess;

  @Column({ type: 'varchar', length: 15, nullable: true })
  whatsapp: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  source: string; // 'website' or 'mobile' to distinguish submission source

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

