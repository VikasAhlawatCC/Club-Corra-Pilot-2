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
exports.BrandCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
const brands_service_1 = require("../brands.service");
const create_brand_category_dto_1 = require("../dto/create-brand-category.dto");
const update_brand_category_dto_1 = require("../dto/update-brand-category.dto");
let BrandCategoriesController = class BrandCategoriesController {
    constructor(brandsService) {
        this.brandsService = brandsService;
    }
    async list() {
        return this.brandsService.findAllCategories();
    }
    async get(id) {
        return this.brandsService.findCategoryById(id);
    }
    async create(createDto) {
        return this.brandsService.createCategory(createDto);
    }
    async update(id, updateDto) {
        return this.brandsService.updateCategory(id, updateDto);
    }
    async remove(id) {
        await this.brandsService.removeCategory(id);
        return { message: 'Category deleted successfully' };
    }
};
exports.BrandCategoriesController = BrandCategoriesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandCategoriesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandCategoriesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_brand_category_dto_1.CreateBrandCategoryDto]),
    __metadata("design:returntype", Promise)
], BrandCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_brand_category_dto_1.UpdateBrandCategoryDto]),
    __metadata("design:returntype", Promise)
], BrandCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandCategoriesController.prototype, "remove", null);
exports.BrandCategoriesController = BrandCategoriesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('brand-categories'),
    __metadata("design:paramtypes", [brands_service_1.BrandsService])
], BrandCategoriesController);
