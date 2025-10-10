import { IsOptional, IsString, IsUUID, IsBoolean, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class BrandSearchDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    // Robust boolean coercion supporting 'true'/'false' and '1'/'0'
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
      return undefined;
    }
    if (typeof value === 'number') return value === 1;
    return undefined;
  })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'categoryName', 'earningPercentage', 'redemptionPercentage', 'brandwiseMaxCap', 'isActive', 'createdAt', 'updatedAt'])
  sortBy?: string = 'updatedAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
