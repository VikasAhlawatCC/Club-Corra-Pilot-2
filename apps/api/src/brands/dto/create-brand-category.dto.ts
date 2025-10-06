import { IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator';

export class CreateBrandCategoryDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
