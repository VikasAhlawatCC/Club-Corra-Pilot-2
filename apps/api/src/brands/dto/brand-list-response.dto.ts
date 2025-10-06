import { Brand } from '../entities/brand.entity';

export class BrandListResponseDto {
  brands!: Brand[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
