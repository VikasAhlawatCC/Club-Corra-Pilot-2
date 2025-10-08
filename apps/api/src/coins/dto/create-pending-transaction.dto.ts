import { IsUUID, IsInt, IsUrl, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator'

export class CreatePendingTransactionDto {
  @IsString()
  @MaxLength(100)
  sessionId!: string

  @IsUUID()
  brandId!: string

  @IsInt()
  @Min(1)
  @Max(100000)
  billAmount!: number

  @IsString()
  @MaxLength(500)
  receiptUrl!: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string
}

export class ClaimPendingTransactionDto {
  @IsString()
  @MaxLength(100)
  sessionId!: string
}

