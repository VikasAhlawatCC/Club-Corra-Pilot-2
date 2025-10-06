import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandsController } from './controllers/brands.controller'
import { BrandCategoriesController } from './controllers/brand-categories.controller'
import { BrandsService } from './brands.service'
import { Brand } from './entities/brand.entity'
import { BrandCategory } from './entities/brand-category.entity'
import { Location } from './entities/location.entity'
import { Offer } from './entities/offer.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Brand, BrandCategory, Location, Offer])],
  controllers: [BrandsController, BrandCategoriesController],
  providers: [BrandsService],
  exports: [BrandsService, TypeOrmModule],
})
export class BrandsModule {}


