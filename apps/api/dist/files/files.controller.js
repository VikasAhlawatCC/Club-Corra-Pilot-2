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
exports.FilesController = exports.FileType = void 0;
const common_1 = require("@nestjs/common");
const s3_service_1 = require("../common/s3/s3.service");
const class_validator_1 = require("class-validator");
var FileType;
(function (FileType) {
    FileType["RECEIPT"] = "RECEIPT";
    FileType["PROFILE_PICTURE"] = "PROFILE_PICTURE";
    FileType["DOCUMENT"] = "DOCUMENT";
    FileType["OTHER"] = "OTHER";
})(FileType || (exports.FileType = FileType = {}));
class GenerateUploadUrlDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FileType),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "fileType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "contentType", void 0);
let FilesController = class FilesController {
    constructor(s3Service) {
        this.s3Service = s3Service;
    }
    async generateUploadUrl(generateUploadUrlDto, req) {
        try {
            const { fileName, fileType, contentType } = generateUploadUrlDto;
            // Generate unique key for the file
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const userId = req?.user?.id || 'temp';
            const key = `uploads/${fileType.toLowerCase()}/${userId}/${timestamp}-${randomId}-${fileName}`;
            // Get S3 bucket from environment
            const bucket = process.env.S3_BUCKET || 'clubcorrarecieptsbucket';
            // Generate pre-signed URL
            const uploadUrl = await this.s3Service.generateUploadUrl({
                bucket,
                key,
                expiresInSeconds: 300, // 5 minutes
                contentType: contentType || 'application/octet-stream'
            });
            return {
                success: true,
                message: 'Upload URL generated successfully',
                data: {
                    uploadUrl,
                    key,
                    bucket,
                    expiresIn: 300
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    async generateDownloadUrl(body, req) {
        try {
            const { key } = body;
            // Get S3 bucket from environment
            const bucket = process.env.S3_BUCKET || 'clubcorrarecieptsbucket';
            // Generate download URL
            const downloadUrl = await this.s3Service.generateDownloadUrl({
                bucket,
                key,
                expiresInSeconds: 3600 // 1 hour
            });
            return {
                success: true,
                message: 'Download URL generated successfully',
                data: {
                    downloadUrl,
                    expiresIn: 3600
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload-url'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateUploadUrlDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "generateUploadUrl", null);
__decorate([
    (0, common_1.Post)('download-url'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "generateDownloadUrl", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], FilesController);
