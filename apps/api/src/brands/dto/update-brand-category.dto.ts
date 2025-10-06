import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandCategoryDto } from './create-brand-category.dto';

export class UpdateBrandCategoryDto extends PartialType(CreateBrandCategoryDto) {}
