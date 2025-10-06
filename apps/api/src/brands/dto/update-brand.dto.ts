import { IsString, IsNumber, IsUUID, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  earningPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  redemptionPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minRedemptionAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRedemptionAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  brandwiseMaxCap?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
