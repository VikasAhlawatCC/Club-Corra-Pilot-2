import { IsString, IsNumber, IsUUID, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsUUID()
  categoryId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  earningPercentage!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  redemptionPercentage!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minRedemptionAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRedemptionAmount?: number;

  @IsNumber()
  @Min(0)
  brandwiseMaxCap!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
