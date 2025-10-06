import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { BrandsService } from '../brands.service'
import { CreateBrandCategoryDto } from '../dto/create-brand-category.dto'
import { UpdateBrandCategoryDto } from '../dto/update-brand-category.dto'
import { BrandCategory } from '../entities/brand-category.entity'

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('brand-categories')
export class BrandCategoriesController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async list(): Promise<BrandCategory[]> {
    return this.brandsService.findAllCategories();
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<BrandCategory> {
    return this.brandsService.findCategoryById(id);
  }

  @Post()
  async create(@Body() createDto: CreateBrandCategoryDto): Promise<BrandCategory> {
    return this.brandsService.createCategory(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateBrandCategoryDto): Promise<BrandCategory> {
    return this.brandsService.updateCategory(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.brandsService.removeCategory(id);
    return { message: 'Category deleted successfully' };
  }
}


