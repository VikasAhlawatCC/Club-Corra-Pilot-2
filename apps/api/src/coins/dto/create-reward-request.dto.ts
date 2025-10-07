import { IsUUID, IsNumber, IsDateString, IsUrl, IsOptional, IsString, IsInt, Min, Max, MaxLength, IsEmail } from 'class-validator'

export class CreateRewardRequestDto {
  @IsUUID()
  brandId!: string

  @IsNumber()
  @Min(0.01)
  @Max(100000)
  billAmount!: number

  @IsDateString()
  billDate!: string

  @IsUrl()
  receiptUrl!: string

  @IsOptional()
  @IsInt()
  @Min(0)
  coinsToRedeem?: number

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  upiId?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tempUserId?: string
}
