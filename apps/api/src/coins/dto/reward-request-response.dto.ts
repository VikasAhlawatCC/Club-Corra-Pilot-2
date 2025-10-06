import { IsOptional, IsString, MaxLength } from 'class-validator'
import { Brand } from '../../brands/entities/brand.entity'

export class RewardRequestResponseDto {
  success!: boolean
  message!: string
  transaction!: {
    id: string
    type: string
    status: string
    billAmount: number
    billDate: Date
    coinsEarned: number
    coinsRedeemed: number
    brand: Brand | null
    createdAt: Date
  }
  newBalance!: number
  transactions!: any[]
  total!: number
  page!: number
  limit!: number
  totalPages!: number
}

export class TransactionApprovalDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string
}

export class TransactionRejectionDto {
  @IsString()
  @MaxLength(1000)
  reason!: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string
}

export class MarkAsPaidDto {
  @IsString()
  @MaxLength(100)
  transactionId!: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string
}
