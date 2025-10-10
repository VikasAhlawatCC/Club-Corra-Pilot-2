"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_entity_1 = require("./entities/brand.entity");
const brand_category_entity_1 = require("./entities/brand-category.entity");
const offer_entity_1 = require("./entities/offer.entity");
const location_entity_1 = require("./entities/location.entity");
let BrandsService = class BrandsService {
    constructor(brandRepository, categoryRepository, offerRepository, locationRepository) {
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.offerRepository = offerRepository;
        this.locationRepository = locationRepository;
    }
    normalizeBoolean(input) {
        if (typeof input === 'boolean')
            return input;
        if (typeof input === 'string') {
            const lower = input.toLowerCase();
            if (lower === 'true' || lower === '1')
                return true;
            if (lower === 'false' || lower === '0')
                return false;
            return undefined;
        }
        if (typeof input === 'number') {
            if (input === 1)
                return true;
            if (input === 0)
                return false;
            return undefined;
        }
        return undefined;
    }
    validateBrandBusinessRules(brandData) {
        // Validate earning percentage
        if (brandData.earningPercentage !== undefined) {
            if (brandData.earningPercentage < 0 || brandData.earningPercentage > 100) {
                throw new common_1.BadRequestException('Earning percentage must be between 0 and 100');
            }
        }
        // Validate redemption percentage
        if (brandData.redemptionPercentage !== undefined) {
            if (brandData.redemptionPercentage < 0 || brandData.redemptionPercentage > 100) {
                throw new common_1.BadRequestException('Redemption percentage must be between 0 and 100');
            }
        }
        // Validate min/max redemption amounts
        if (brandData.minRedemptionAmount !== undefined && brandData.maxRedemptionAmount !== undefined) {
            if (brandData.minRedemptionAmount > brandData.maxRedemptionAmount) {
                throw new common_1.BadRequestException('Minimum redemption amount cannot be greater than maximum');
            }
        }
    }
    async create(createBrandDto) {
        // Validate that category exists if provided
        if (createBrandDto.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: createBrandDto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException('Brand category not found');
            }
        }
        // Validate business rules
        this.validateBrandBusinessRules(createBrandDto);
        const brand = this.brandRepository.create(createBrandDto);
        return this.brandRepository.save(brand);
    }
    async findAll(searchDto) {
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
                queryBuilder = queryBuilder.andWhere('(brand.name ILIKE :query OR brand.description ILIKE :query)', { query: `%${query}%` });
            }
            // Apply sorting
            const sortDirection = sortOrder.toUpperCase();
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
        }
        catch (error) {
            // Fallback to simple query without joins
            return this.findAllFallback(searchDto);
        }
    }
    async findAllFallback(searchDto) {
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
            queryBuilder = queryBuilder.andWhere('(brand.name ILIKE :query OR brand.description ILIKE :query)', { query: `%${query}%` });
        }
        // Apply sorting for fallback (without category join)
        const sortDirection = sortOrder.toUpperCase();
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
    async findOne(id) {
        try {
            const brand = await this.brandRepository
                .createQueryBuilder('brand')
                .leftJoinAndSelect('brand.category', 'category')
                .leftJoinAndSelect('brand.offers', 'offers')
                .leftJoinAndSelect('brand.locations', 'locations')
                .where('brand.id = :id', { id })
                .getOne();
            if (!brand) {
                throw new common_1.NotFoundException(`Brand with ID ${id} not found`);
            }
            // Ensure arrays exist even if empty
            brand.offers = brand.offers || [];
            brand.locations = brand.locations || [];
            return brand;
        }
        catch (error) {
            // Fallback to simple query without relations
            const brand = await this.brandRepository.findOne({
                where: { id },
            });
            if (!brand) {
                throw new common_1.NotFoundException(`Brand with ID ${id} not found`);
            }
            // Ensure arrays exist even if empty
            brand.offers = [];
            brand.locations = [];
            return brand;
        }
    }
    async update(id, updateBrandDto) {
        console.log('Brand update request:', { id, updateBrandDto });
        const brand = await this.findOne(id);
        // If category is being updated, validate it exists
        if (updateBrandDto.categoryId && updateBrandDto.categoryId !== brand.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: updateBrandDto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException('Brand category not found');
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
    async remove(id) {
        const brand = await this.findOne(id);
        // Check if brand has any transactions
        try {
            const transactionCount = await this.brandRepository
                .createQueryBuilder('brand')
                .leftJoin('brand.transactions', 'transactions')
                .where('brand.id = :id', { id })
                .getCount();
            if (transactionCount > 0) {
                throw new common_1.BadRequestException('Cannot delete brand with existing transactions');
            }
        }
        catch (error) {
            // If the join fails, assume no transactions and continue
        }
        await this.brandRepository.remove(brand);
    }
    async toggleStatus(id) {
        const brand = await this.findOne(id);
        brand.isActive = !brand.isActive;
        return this.brandRepository.save(brand);
    }
    async findActiveBrands() {
        try {
            return this.brandRepository.find({
                where: { isActive: true },
                relations: ['category'],
                order: { name: 'ASC' },
            });
        }
        catch (error) {
            // If the relation fails, try without it
            return this.brandRepository.find({
                where: { isActive: true },
                order: { name: 'ASC' },
            });
        }
    }
    async findByCategory(categoryId) {
        return this.brandRepository.find({
            where: { categoryId, isActive: true },
            relations: ['category'],
            order: { name: 'ASC' },
        });
    }
    // Brand Categories Service
    async createCategory(createCategoryDto) {
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }
    async findAllCategories() {
        return this.categoryRepository.find({
            order: { name: 'ASC' },
        });
    }
    async findCategoryById(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Brand category with ID ${id} not found`);
        }
        return category;
    }
    async updateCategory(id, updateCategoryDto) {
        const category = await this.findCategoryById(id);
        Object.assign(category, updateCategoryDto);
        return this.categoryRepository.save(category);
    }
    async removeCategory(id) {
        const category = await this.findCategoryById(id);
        // Check if category has any brands
        const brandCount = await this.brandRepository.count({
            where: { categoryId: id },
        });
        if (brandCount > 0) {
            throw new common_1.BadRequestException('Cannot delete category with existing brands');
        }
        await this.categoryRepository.remove(category);
    }
    // Offers Service
    async createOffer(brandId, createOfferDto) {
        // Validate brand exists
        const brand = await this.findOne(brandId);
        const offer = this.offerRepository.create({
            ...createOfferDto,
            brandId,
        });
        return await this.offerRepository.save(offer);
    }
    async getOffersByBrand(brandId) {
        return this.offerRepository.find({
            where: { brandId },
            order: { createdAt: 'DESC' },
        });
    }
    async updateOffer(id, updateOfferDto) {
        const offer = await this.offerRepository.findOne({
            where: { id },
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        Object.assign(offer, updateOfferDto);
        return this.offerRepository.save(offer);
    }
    async removeOffer(id) {
        const offer = await this.offerRepository.findOne({
            where: { id },
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        await this.offerRepository.remove(offer);
    }
    // Locations Service
    async createLocation(brandId, createLocationDto) {
        // Validate brand exists
        const brand = await this.findOne(brandId);
        const location = this.locationRepository.create({
            ...createLocationDto,
            brandId,
        });
        return await this.locationRepository.save(location);
    }
    async getLocationsByBrand(brandId) {
        return this.locationRepository.find({
            where: { brandId },
            order: { name: 'ASC' },
        });
    }
    async updateLocation(id, updateLocationDto) {
        const location = await this.locationRepository.findOne({
            where: { id },
        });
        if (!location) {
            throw new common_1.NotFoundException('Location not found');
        }
        Object.assign(location, updateLocationDto);
        return this.locationRepository.save(location);
    }
    async removeLocation(id) {
        const location = await this.locationRepository.findOne({
            where: { id },
        });
        if (!location) {
            throw new common_1.NotFoundException('Location not found');
        }
        await this.locationRepository.remove(location);
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __param(1, (0, typeorm_1.InjectRepository)(brand_category_entity_1.BrandCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(offer_entity_1.Offer)),
    __param(3, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BrandsService);
