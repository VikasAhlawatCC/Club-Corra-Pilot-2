import { Column, Entity, Index, OneToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { UserProfile } from './user-profile.entity'
import { PaymentDetails } from './payment-details.entity'
import { AuthProviderLink } from './auth-provider.entity'
import { CoinBalance } from '../../coins/entities/coin-balance.entity'
import { CoinTransaction } from '../../coins/entities/coin-transaction.entity'
import { Notification } from '../../notifications/notification.entity'
import { File } from '../../files/file.entity'

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar' })
  mobileNumber!: string

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  email?: string

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status!: UserStatus

  @Column({ type: 'boolean', default: false })
  isMobileVerified!: boolean

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean

  @Column({ type: 'boolean', default: false, nullable: true })
  hasWelcomeBonusProcessed?: boolean

  @Column({ type: 'varchar', nullable: true })
  passwordHash?: string

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash?: string

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken?: string

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpiresAt?: Date

  @Column({ type: 'varchar', nullable: true })
  passwordResetToken?: string

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt?: Date

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date

  @Column('simple-array', { default: 'USER' })
  roles!: string[]

  @Column({ type: 'uuid', nullable: true })
  profileId?: string

  @Column({ type: 'uuid', nullable: true })
  paymentDetailsId?: string

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  firebaseUid?: string

  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  profile?: UserProfile

  @OneToOne(() => PaymentDetails, payment => payment.user, { cascade: true })
  paymentDetails?: PaymentDetails

  @OneToMany(() => AuthProviderLink, provider => provider.user, { cascade: true })
  authProviders!: AuthProviderLink[]

  @OneToOne(() => CoinBalance, coinBalance => coinBalance.user, { cascade: true })
  coinBalance?: CoinBalance

  @OneToMany(() => CoinTransaction, transaction => transaction.user)
  coinTransactions!: CoinTransaction[]

  @OneToMany(() => File, file => file.user)
  files!: File[]

  @OneToMany(() => Notification, notification => notification.user)
  notifications!: Notification[]
}


