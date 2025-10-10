import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { BrandCategory } from './entities/brand-category.entity';
import { Offer } from './entities/offer.entity';
import { Location } from './entities/location.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandSearchDto } from './dto/brand-search.dto';
import { BrandListResponseDto } from './dto/brand-list-response.dto';
import { CreateBrandCategoryDto } from './dto/create-brand-category.dto';
import { UpdateBrandCategoryDto } from './dto/update-brand-category.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(BrandCategory)
    private categoryRepository: Repository<BrandCategory>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  private normalizeBoolean(input: any): boolean | undefined {
    if (typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
      return undefined;
    }
    if (typeof input === 'number') {
      if (input === 1) return true;
      if (input === 0) return false;
      return undefined;
    }
    return undefined;
  }

  private validateBrandBusinessRules(brandData: any): void {
    // Validate earning percentage
    if (brandData.earningPercentage !== undefined) {
      if (brandData.earningPercentage < 0 || brandData.earningPercentage > 100) {
        throw new BadRequestException('Earning percentage must be between 0 and 100');
      }
    }

    // Validate redemption percentage
    if (brandData.redemptionPercentage !== undefined) {
      if (brandData.redemptionPercentage < 0 || brandData.redemptionPercentage > 100) {
        throw new BadRequestException('Redemption percentage must be between 0 and 100');
      }
    }

    // Validate min/max redemption amounts
    if (brandData.minRedemptionAmount !== undefined && brandData.maxRedemptionAmount !== undefined) {
      if (brandData.minRedemptionAmount > brandData.maxRedemptionAmount) {
        throw new BadRequestException('Minimum redemption amount cannot be greater than maximum');
      }
    }
  }

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    // Validate that category exists if provided
    if (createBrandDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createBrandDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Brand category not found');
      }
    }

    // Validate business rules
    this.validateBrandBusinessRules(createBrandDto);

    const brand = this.brandRepository.create(createBrandDto);
    return this.brandRepository.save(brand);
  }

  async findAll(searchDto: BrandSearchDto): Promise<BrandListResponseDto> {
    const { query, categoryId, isActive, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 20 } = searchDto;
    const skip = (page - 1) * limit;

    try {
      // Build query with proper joins for category information
      let queryBuilder = this.brandRepository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.category', 'category')
        .select([
          'brand.id',
          'brand.name',
          'brand.description',
          'brand.logoUrl',
          'brand.categoryId',
          'brand.earningPercentage',
          'brand.redemptionPercentage',
          'brand.minRedemptionAmount',
          'brand.maxRedemptionAmount',
          'brand.brandwiseMaxCap',
          'brand.isActive',
          'brand.createdAt',
          'brand.updatedAt',
          'category.id',
          'category.name',
          'category.description',
          'category.icon',
          'category.color'
        ])
        .where('1=1');

      if (categoryId) {
        queryBuilder = queryBuilder.andWhere('brand.categoryId = :categoryId', { categoryId });
      }

      const normalizedIsActive = this.normalizeBoolean(isActive);
      if (normalizedIsActive !== undefined) {
        queryBuilder = queryBuilder.andWhere('brand.isActive = :isActive', { isActive: normalizedIsActive });
      }

      if (query) {
        queryBuilder = queryBuilder.andWhere(
          '(brand.name ILIKE :query OR brand.description ILIKE :query)',
          { query: `%${query}%` }
        );
      }

      // Apply sorting
      const sortDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';
      let orderByField = 'brand.updatedAt';
      
      switch (sortBy) {
        case 'name':
          orderByField = 'brand.name';
          break;
        case 'categoryName':
          orderByField = 'category.name';
          break;
        case 'earningPercentage':
          orderByField = 'brand.earningPercentage';
          break;
        case 'redemptionPercentage':
          orderByField = 'brand.redemptionPercentage';
          break;
        case 'brandwiseMaxCap':
          orderByField = 'brand.brandwiseMaxCap';
          break;
        case 'isActive':
          orderByField = 'brand.isActive';
          break;
        case 'createdAt':
          orderByField = 'brand.createdAt';
          break;
        case 'updatedAt':
        default:
          orderByField = 'brand.updatedAt';
          break;
      }

      const [brands, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy(orderByField, sortDirection)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        brands,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      // Fallback to simple query without joins
      return this.findAllFallback(searchDto);
    }
  }

  private async findAllFallback(searchDto: BrandSearchDto): Promise<BrandListResponseDto> {
    const { query, categoryId, isActive, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 20 } = searchDto;
    const skip = (page - 1) * limit;

    let queryBuilder = this.brandRepository
      .createQueryBuilder('brand')
      .select([
        'brand.id',
        'brand.name',
        'brand.description',
        'brand.logoUrl',
        'brand.categoryId',
        'brand.earningPercentage',
        'brand.redemptionPercentage',
        'brand.minRedemptionAmount',
        'brand.maxRedemptionAmount',
        'brand.brandwiseMaxCap',
        'brand.isActive',
        'brand.createdAt',
        'brand.updatedAt'
      ])
      .where('1=1');

    if (categoryId) {
      queryBuilder = queryBuilder.andWhere('brand.categoryId = :categoryId', { categoryId });
    }

    const normalizedIsActive = this.normalizeBoolean(isActive);
    if (normalizedIsActive !== undefined) {
      queryBuilder = queryBuilder.andWhere('brand.isActive = :isActive', { isActive: normalizedIsActive });
    }

    if (query) {
      queryBuilder = queryBuilder.andWhere(
        '(brand.name ILIKE :query OR brand.description ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    // Apply sorting for fallback (without category join)
    const sortDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    let orderByField = 'brand.updatedAt';
    
    switch (sortBy) {
      case 'name':
        orderByField = 'brand.name';
        break;
      case 'earningPercentage':
        orderByField = 'brand.earningPercentage';
        break;
      case 'redemptionPercentage':
        orderByField = 'brand.redemptionPercentage';
        break;
      case 'brandwiseMaxCap':
        orderByField = 'brand.brandwiseMaxCap';
        break;
      case 'isActive':
        orderByField = 'brand.isActive';
        break;
      case 'createdAt':
        orderByField = 'brand.createdAt';
        break;
      case 'updatedAt':
      default:
        orderByField = 'brand.updatedAt';
        break;
      // Note: categoryName sorting not available in fallback mode
    }

    const [brands, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(orderByField, sortDirection)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      brands,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Brand> {
    try {
      const brand = await this.brandRepository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.category', 'category')
        .leftJoinAndSelect('brand.offers', 'offers')
        .leftJoinAndSelect('brand.locations', 'locations')
        .where('brand.id = :id', { id })
        .getOne();

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${id} not found`);
      }

      // Ensure arrays exist even if empty
      brand.offers = brand.offers || [];
      brand.locations = brand.locations || [];

      return brand;
    } catch (error) {
      // Fallback to simple query without relations
      const brand = await this.brandRepository.findOne({
        where: { id },
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${id} not found`);
      }

      // Ensure arrays exist even if empty
      brand.offers = [];
      brand.locations = [];

      return brand;
    }
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    console.log('Brand update request:', { id, updateBrandDto });
    const brand = await this.findOne(id);

    // If category is being updated, validate it exists
    if (updateBrandDto.categoryId && updateBrandDto.categoryId !== brand.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateBrandDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Brand category not found');
      }
    }

    // Validate business rules if percentages are being updated
    if (updateBrandDto.earningPercentage !== undefined || 
        updateBrandDto.redemptionPercentage !== undefined ||
        updateBrandDto.minRedemptionAmount !== undefined ||
        updateBrandDto.maxRedemptionAmount !== undefined) {
      const updatedData = { ...brand, ...updateBrandDto };
      this.validateBrandBusinessRules(updatedData);
    }

    Object.assign(brand, updateBrandDto);
    console.log('Brand before save:', { id: brand.id, categoryId: brand.categoryId, name: brand.name });
    return this.brandRepository.save(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    
    // Check if brand has any transactions
    try {
      const transactionCount = await this.brandRepository
        .createQueryBuilder('brand')
        .leftJoin('brand.transactions', 'transactions')
        .where('brand.id = :id', { id })
        .getCount();

      if (transactionCount > 0) {
        throw new BadRequestException('Cannot delete brand with existing transactions');
      }
    } catch (error) {
      // If the join fails, assume no transactions and continue
    }

    await this.brandRepository.remove(brand);
  }

  async toggleStatus(id: string): Promise<Brand> {
    const brand = await this.findOne(id);
    brand.isActive = !brand.isActive;
    return this.brandRepository.save(brand);
  }

  async findActiveBrands(): Promise<Brand[]> {
    try {
      return this.brandRepository.find({
        where: { isActive: true },
        relations: ['category'],
        order: { name: 'ASC' },
      });
    } catch (error) {
      // If the relation fails, try without it
      return this.brandRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    }
  }

  async findByCategory(categoryId: string): Promise<Brand[]> {
    return this.brandRepository.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  // Brand Categories Service
  async createCategory(createCategoryDto: CreateBrandCategoryDto): Promise<BrandCategory> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<BrandCategory[]> {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<BrandCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Brand category with ID ${id} not found`);
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateBrandCategoryDto): Promise<BrandCategory> {
    const category = await this.findCategoryById(id);
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);
    
    // Check if category has any brands
    const brandCount = await this.brandRepository.count({
      where: { categoryId: id },
    });

    if (brandCount > 0) {
      throw new BadRequestException('Cannot delete category with existing brands');
    }

    await this.categoryRepository.remove(category);
  }

  // Offers Service
  async createOffer(brandId: string, createOfferDto: any): Promise<Offer> {
    // Validate brand exists
    const brand = await this.findOne(brandId);
    
    const offer = this.offerRepository.create({
      ...createOfferDto,
      brandId,
    });
    
    return await this.offerRepository.save(offer) as unknown as Offer;
  }

  async getOffersByBrand(brandId: string): Promise<Offer[]> {
    return this.offerRepository.find({
      where: { brandId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateOffer(id: string, updateOfferDto: any): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    Object.assign(offer, updateOfferDto);
    return this.offerRepository.save(offer);
  }

  async removeOffer(id: string): Promise<void> {
    const offer = await this.offerRepository.findOne({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    await this.offerRepository.remove(offer);
  }

  // Locations Service
  async createLocation(brandId: string, createLocationDto: any): Promise<Location> {
    // Validate brand exists
    const brand = await this.findOne(brandId);
    
    const location = this.locationRepository.create({
      ...createLocationDto,
      brandId,
    });
    
    return await this.locationRepository.save(location) as unknown as Location;
  }

  async getLocationsByBrand(brandId: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { brandId },
      order: { name: 'ASC' },
    });
  }

  async updateLocation(id: string, updateLocationDto: any): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    Object.assign(location, updateLocationDto);
    return this.locationRepository.save(location);
  }

  async removeLocation(id: string): Promise<void> {
    const location = await this.locationRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    await this.locationRepository.remove(location);
  }
}
