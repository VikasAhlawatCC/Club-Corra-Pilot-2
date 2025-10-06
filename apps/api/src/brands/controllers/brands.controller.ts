import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { BrandsService } from '../brands.service'
import { CreateBrandDto } from '../dto/create-brand.dto'
import { UpdateBrandDto } from '../dto/update-brand.dto'
import { BrandSearchDto } from '../dto/brand-search.dto'
import { BrandListResponseDto } from '../dto/brand-list-response.dto'
import { Brand } from '../entities/brand.entity'

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async list(@Query() searchDto: BrandSearchDto): Promise<BrandListResponseDto> {
    return this.brandsService.findAll(searchDto);
  }

  @Get('active')
  async active(): Promise<Brand[]> {
    return this.brandsService.findActiveBrands();
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<Brand> {
    return this.brandsService.findOne(id);
  }

  @Get('category/:id')
  async byCategory(@Param('id') id: string): Promise<Brand[]> {
    return this.brandsService.findByCategory(id);
  }

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto): Promise<Brand> {
    return this.brandsService.create(createBrandDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto): Promise<Brand> {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.brandsService.remove(id);
    return { message: 'Brand deleted successfully' };
  }

  // Offers endpoints
  @Post(':id/offers')
  async createOffer(@Param('id') brandId: string, @Body() createOfferDto: any) {
    return this.brandsService.createOffer(brandId, createOfferDto);
  }

  @Get(':id/offers')
  async getOffers(@Param('id') brandId: string) {
    return this.brandsService.getOffersByBrand(brandId);
  }

  @Put('offers/:offerId')
  async updateOffer(@Param('offerId') id: string, @Body() updateOfferDto: any) {
    return this.brandsService.updateOffer(id, updateOfferDto);
  }

  @Delete('offers/:offerId')
  async removeOffer(@Param('offerId') id: string) {
    await this.brandsService.removeOffer(id);
    return { message: 'Offer deleted successfully' };
  }

  // Locations endpoints
  @Post(':id/locations')
  async createLocation(@Param('id') brandId: string, @Body() createLocationDto: any) {
    return this.brandsService.createLocation(brandId, createLocationDto);
  }

  @Get(':id/locations')
  async getLocations(@Param('id') brandId: string) {
    return this.brandsService.getLocationsByBrand(brandId);
  }

  @Put('locations/:locationId')
  async updateLocation(@Param('locationId') id: string, @Body() updateLocationDto: any) {
    return this.brandsService.updateLocation(id, updateLocationDto);
  }

  @Delete('locations/:locationId')
  async removeLocation(@Param('locationId') id: string) {
    await this.brandsService.removeLocation(id);
    return { message: 'Location deleted successfully' };
  }
}


