import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator'
import { CoinTransaction } from '../entities/coin-transaction.entity'

export class AdminTransactionDto {
  @IsString()
  id!: string

  @IsString()
  userId!: string

  @IsString()
  userName!: string

  @IsString()
  userMobile!: string

  @IsEnum(['EARN', 'REDEEM', 'WELCOME_BONUS', 'ADJUSTMENT', 'REWARD_REQUEST'])
  type!: string

  @IsNumber()
  amount!: number // Converted from string to number

  @IsEnum(['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED', 'PAID', 'UNPAID', 'COMPLETED', 'FAILED'])
  status!: string

  @IsOptional()
  @IsString()
  brandName?: string

  @IsOptional()
  @IsString()
  brandId?: string

  @IsOptional()
  @IsNumber()
  billAmount?: number

  @IsOptional()
  @IsString()
  receiptUrl?: string

  @IsOptional()
  @IsString()
  adminNotes?: string

  @IsDateString()
  createdAt!: Date

  @IsDateString()
  updatedAt!: Date

  @IsOptional()
  @IsNumber()
  coinsEarned?: number

  @IsOptional()
  @IsNumber()
  coinsRedeemed?: number

  @IsOptional()
  @IsDateString()
  billDate?: Date

  @IsOptional()
  @IsString()
  transactionId?: string

  @IsOptional()
  @IsDateString()
  processedAt?: Date

  @IsOptional()
  @IsDateString()
  paymentProcessedAt?: Date

  @IsOptional()
  @IsDateString()
  statusUpdatedAt?: Date

  @IsOptional()
  brand?: {
    id: string
    name: string
    logoUrl?: string
    description?: string
  }

  @IsOptional()
  @IsNumber()
  userBalance?: number

  @IsOptional()
  @IsNumber()
  isOldestPending?: boolean

  @IsOptional()
  @IsString()
  userUpiId?: string
}

/**
 * Converts a CoinTransaction entity to AdminTransactionDto
 * Handles the conversion of amount from string to number
 */
export function convertToAdminTransactionDto(transaction: CoinTransaction): AdminTransactionDto {
  return {
    id: transaction.id,
    userId: transaction.user?.id || 'unknown',
    userName: transaction.user?.mobileNumber || 'Unknown User',
    userMobile: transaction.user?.mobileNumber || 'Unknown',
    type: transaction.type,
    amount: parseInt(transaction.amount) || 0, // Convert string to number
    status: transaction.status,
    brandName: transaction.brand?.name,
    brandId: transaction.brand?.id,
    billAmount: transaction.billAmount,
    receiptUrl: transaction.receiptUrl,
    adminNotes: transaction.adminNotes,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    coinsEarned: transaction.coinsEarned,
    coinsRedeemed: transaction.coinsRedeemed,
    billDate: transaction.billDate,
    transactionId: transaction.transactionId,
    processedAt: transaction.processedAt,
    paymentProcessedAt: transaction.paymentProcessedAt,
    statusUpdatedAt: transaction.statusUpdatedAt,
    brand: transaction.brand ? {
      id: transaction.brand.id,
      name: transaction.brand.name,
      logoUrl: transaction.brand.logoUrl,
      description: transaction.brand.description,
    } : undefined,
    userBalance: undefined, // This would need to be populated separately
    isOldestPending: undefined, // This would need to be calculated separately
    userUpiId: transaction.user?.paymentDetails?.upiId,
  }
}
