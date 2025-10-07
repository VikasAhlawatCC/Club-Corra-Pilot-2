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
exports.CoinPublicController = void 0;
const common_1 = require("@nestjs/common");
const files_service_1 = require("../../files/files.service");
const coins_service_1 = require("../coins.service");
const class_validator_1 = require("class-validator");
const file_entity_1 = require("../../files/file.entity");
class GenerateUploadUrlDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(file_entity_1.FileType),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "fileType", void 0);
class CreatePublicRewardRequestDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePublicRewardRequestDto.prototype, "brandId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreatePublicRewardRequestDto.prototype, "billAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePublicRewardRequestDto.prototype, "billDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePublicRewardRequestDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePublicRewardRequestDto.prototype, "coinsToRedeem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePublicRewardRequestDto.prototype, "upiId", void 0);
let CoinPublicController = class CoinPublicController {
    constructor(filesService, coinsService) {
        this.filesService = filesService;
        this.coinsService = coinsService;
    }
    async generateUploadUrl(body) {
        try {
            const { uploadUrl, fileKey, publicUrl } = await this.filesService.generatePresignedUploadUrl(body.fileName, body.mimeType, body.fileType || file_entity_1.FileType.RECEIPT);
            return {
                success: true,
                message: 'Upload URL generated successfully',
                data: {
                    uploadUrl,
                    fileKey,
                    publicUrl,
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    async createPublicRewardRequest(body) {
        try {
            // For unauthenticated users, we'll store the request temporarily
            // and associate it with the user after they log in
            const tempUserId = 'temp_' + Date.now(); // Temporary ID for unauthenticated requests
            const createRewardRequestDto = {
                brandId: body.brandId,
                billAmount: body.billAmount,
                billDate: body.billDate,
                receiptUrl: body.receiptUrl,
                coinsToRedeem: body.coinsToRedeem || 0,
            };
            // Create the reward request with temporary user ID
            const result = await this.coinsService.createRewardRequest(tempUserId, createRewardRequestDto);
            return {
                success: true,
                message: 'Reward request submitted successfully. Please log in to complete the process.',
                data: {
                    tempTransactionId: result.transaction.id,
                    requiresLogin: true,
                    redirectUrl: '/login',
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getActiveBrands() {
        try {
            // This would typically come from a brands service
            // For now, return a placeholder response
            return {
                success: true,
                message: 'Active brands retrieved successfully',
                data: [
                    {
                        id: '1',
                        name: 'Adidas',
                        logoUrl: 'https://example.com/adidas-logo.png',
                        earningPercentage: 5,
                        redemptionPercentage: 2,
                        isActive: true,
                    },
                    {
                        id: '2',
                        name: 'Nike',
                        logoUrl: 'https://example.com/nike-logo.png',
                        earningPercentage: 4,
                        redemptionPercentage: 2,
                        isActive: true,
                    },
                ]
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.CoinPublicController = CoinPublicController;
__decorate([
    (0, common_1.Post)('upload-url'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateUploadUrlDto]),
    __metadata("design:returntype", Promise)
], CoinPublicController.prototype, "generateUploadUrl", null);
__decorate([
    (0, common_1.Post)('reward-request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePublicRewardRequestDto]),
    __metadata("design:returntype", Promise)
], CoinPublicController.prototype, "createPublicRewardRequest", null);
__decorate([
    (0, common_1.Get)('brands'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoinPublicController.prototype, "getActiveBrands", null);
exports.CoinPublicController = CoinPublicController = __decorate([
    (0, common_1.Controller)('public/transactions'),
    __metadata("design:paramtypes", [files_service_1.FilesService,
        coins_service_1.CoinsService])
], CoinPublicController);
