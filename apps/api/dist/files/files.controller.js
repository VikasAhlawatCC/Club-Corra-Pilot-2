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
const platform_express_1 = require("@nestjs/platform-express");
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
    async test() {
        return {
            success: true,
            message: 'Files controller is working'
        };
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
    async configureCors() {
        try {
            const bucket = process.env.S3_BUCKET || 'clubcorrarecieptsbucket';
            await this.s3Service.configureCors(bucket);
            return {
                success: true,
                message: 'CORS configuration updated successfully'
            };
        }
        catch (error) {
            throw error;
        }
    }
    async uploadFile(file, body) {
        try {
            if (!file) {
                throw new Error('No file provided');
            }
            const fileName = body.fileName || file.originalname;
            const mimeType = body.mimeType || file.mimetype;
            // Generate unique key for the file
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const fileExtension = fileName.split('.').pop() || '';
            const key = `uploads/receipt/${timestamp}-${randomId}.${fileExtension}`;
            // Get S3 bucket from environment
            const bucket = process.env.S3_BUCKET || 'clubcorrarecieptsbucket';
            // Upload file to S3
            const uploadUrl = await this.s3Service.generateUploadUrl({
                bucket,
                key,
                expiresInSeconds: 300,
                contentType: mimeType
            });
            // Upload the file to S3
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file.buffer,
                headers: {
                    'Content-Type': mimeType,
                },
            });
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file to S3');
            }
            const region = process.env.S3_REGION || 'eu-north-1';
            const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
            return {
                success: true,
                message: 'File uploaded successfully',
                data: {
                    fileKey: key,
                    publicUrl: publicUrl,
                    fileName: fileName,
                    mimeType: mimeType,
                    size: file.size
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
    (0, common_1.Post)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "test", null);
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
__decorate([
    (0, common_1.Post)('configure-cors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "configureCors", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], FilesController);
