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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const file_entity_1 = require("./file.entity");
const uuid_1 = require("uuid");
let FilesService = class FilesService {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.S3_REGION || 'eu-north-1',
            credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            } : undefined,
        });
        this.bucketName = process.env.S3_BUCKET || 'clubcorrarecieptsbucket';
    }
    async generatePresignedUploadUrl(fileName, mimeType, fileType = file_entity_1.FileType.RECEIPT, userId) {
        try {
            console.log('Generating presigned URL with config:', {
                bucketName: this.bucketName,
                region: process.env.S3_REGION || 'eu-north-1',
                hasCredentials: !!(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)
            });
            // Validate file type and size
            this.validateFileType(mimeType);
            // Generate unique file key
            const fileExtension = this.getFileExtension(fileName);
            const fileKey = `uploads/${fileType.toLowerCase()}/${(0, uuid_1.v4)()}${fileExtension}`;
            console.log('Generated file key:', fileKey);
            // Create presigned URL for upload
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                ContentType: mimeType,
                Metadata: {
                    originalName: fileName,
                    uploadedBy: userId || 'anonymous',
                    fileType: fileType,
                },
            });
            const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
            const region = process.env.S3_REGION || 'eu-north-1';
            const publicUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
            console.log('Generated URLs:', {
                uploadUrl: uploadUrl.substring(0, 100) + '...',
                publicUrl
            });
            return {
                uploadUrl,
                fileKey,
                publicUrl,
            };
        }
        catch (error) {
            console.error('Error generating presigned URL:', error);
            throw new common_1.BadRequestException(`Failed to generate upload URL: ${error.message}`);
        }
    }
    async saveFileRecord(fileKey, fileName, originalName, mimeType, size, fileType, userId, description) {
        const publicUrl = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
        const file = this.fileRepository.create({
            userId: userId || 'anonymous',
            fileName,
            originalName,
            mimeType,
            size,
            url: publicUrl,
            type: fileType,
            description,
        });
        return this.fileRepository.save(file);
    }
    async getFileById(id) {
        return this.fileRepository.findOne({ where: { id } });
    }
    async getUserFiles(userId, fileType) {
        const queryBuilder = this.fileRepository
            .createQueryBuilder('file')
            .where('file.userId = :userId', { userId })
            .orderBy('file.createdAt', 'DESC');
        if (fileType) {
            queryBuilder.andWhere('file.type = :fileType', { fileType });
        }
        return queryBuilder.getMany();
    }
    validateFileType(mimeType) {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
        ];
        if (!allowedTypes.includes(mimeType)) {
            throw new common_1.BadRequestException(`File type ${mimeType} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
    }
    getFileExtension(fileName) {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return '';
        }
        return fileName.substring(lastDotIndex);
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FilesService);
