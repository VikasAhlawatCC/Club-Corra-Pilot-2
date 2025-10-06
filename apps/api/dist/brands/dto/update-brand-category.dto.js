"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBrandCategoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_brand_category_dto_1 = require("./create-brand-category.dto");
class UpdateBrandCategoryDto extends (0, mapped_types_1.PartialType)(create_brand_category_dto_1.CreateBrandCategoryDto) {
}
exports.UpdateBrandCategoryDto = UpdateBrandCategoryDto;
