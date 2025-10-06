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
exports.BrandsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
const brands_service_1 = require("../brands.service");
const create_brand_dto_1 = require("../dto/create-brand.dto");
const update_brand_dto_1 = require("../dto/update-brand.dto");
const brand_search_dto_1 = require("../dto/brand-search.dto");
let BrandsController = class BrandsController {
    constructor(brandsService) {
        this.brandsService = brandsService;
    }
    async list(searchDto) {
        return this.brandsService.findAll(searchDto);
    }
    async active() {
        return this.brandsService.findActiveBrands();
    }
    async get(id) {
        return this.brandsService.findOne(id);
    }
    async byCategory(id) {
        return this.brandsService.findByCategory(id);
    }
    async create(createBrandDto) {
        return this.brandsService.create(createBrandDto);
    }
    async update(id, updateBrandDto) {
        return this.brandsService.update(id, updateBrandDto);
    }
    async remove(id) {
        await this.brandsService.remove(id);
        return { message: 'Brand deleted successfully' };
    }
    // Offers endpoints
    async createOffer(brandId, createOfferDto) {
        return this.brandsService.createOffer(brandId, createOfferDto);
    }
    async getOffers(brandId) {
        return this.brandsService.getOffersByBrand(brandId);
    }
    async updateOffer(id, updateOfferDto) {
        return this.brandsService.updateOffer(id, updateOfferDto);
    }
    async removeOffer(id) {
        await this.brandsService.removeOffer(id);
        return { message: 'Offer deleted successfully' };
    }
    // Locations endpoints
    async createLocation(brandId, createLocationDto) {
        return this.brandsService.createLocation(brandId, createLocationDto);
    }
    async getLocations(brandId) {
        return this.brandsService.getLocationsByBrand(brandId);
    }
    async updateLocation(id, updateLocationDto) {
        return this.brandsService.updateLocation(id, updateLocationDto);
    }
    async removeLocation(id) {
        await this.brandsService.removeLocation(id);
        return { message: 'Location deleted successfully' };
    }
};
exports.BrandsController = BrandsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [brand_search_dto_1.BrandSearchDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "active", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)('category/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "byCategory", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_brand_dto_1.CreateBrandDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_brand_dto_1.UpdateBrandDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/offers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "createOffer", null);
__decorate([
    (0, common_1.Get)(':id/offers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getOffers", null);
__decorate([
    (0, common_1.Put)('offers/:offerId'),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "updateOffer", null);
__decorate([
    (0, common_1.Delete)('offers/:offerId'),
    __param(0, (0, common_1.Param)('offerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "removeOffer", null);
__decorate([
    (0, common_1.Post)(':id/locations'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Get)(':id/locations'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Put)('locations/:locationId'),
    __param(0, (0, common_1.Param)('locationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)('locations/:locationId'),
    __param(0, (0, common_1.Param)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "removeLocation", null);
exports.BrandsController = BrandsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('brands'),
    __metadata("design:paramtypes", [brands_service_1.BrandsService])
], BrandsController);
