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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brand = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const brand_category_entity_1 = require("./brand-category.entity");
const location_entity_1 = require("./location.entity");
const offer_entity_1 = require("./offer.entity");
const coin_transaction_entity_1 = require("../../coins/entities/coin-transaction.entity");
let Brand = class Brand extends base_entity_1.BaseEntity {
};
exports.Brand = Brand;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Brand.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Brand.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 10
    }),
    __metadata("design:type", Number)
], Brand.prototype, "earningPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 30
    }),
    __metadata("design:type", Number)
], Brand.prototype, "redemptionPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Brand.prototype, "minRedemptionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 2000 }),
    __metadata("design:type", Number)
], Brand.prototype, "maxRedemptionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 2000 }),
    __metadata("design:type", Number)
], Brand.prototype, "brandwiseMaxCap", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Brand.prototype, "maxRedemptionPerTransaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Brand.prototype, "maxEarningPerTransaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Brand.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => brand_category_entity_1.BrandCategory, category => category.brands, { nullable: true }),
    __metadata("design:type", Object)
], Brand.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => location_entity_1.Location, location => location.brand),
    __metadata("design:type", Array)
], Brand.prototype, "locations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => offer_entity_1.Offer, offer => offer.brand),
    __metadata("design:type", Array)
], Brand.prototype, "offers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => coin_transaction_entity_1.CoinTransaction, transaction => transaction.brand),
    __metadata("design:type", Array)
], Brand.prototype, "transactions", void 0);
exports.Brand = Brand = __decorate([
    (0, typeorm_1.Entity)('brands')
], Brand);
