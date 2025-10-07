import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { S3Service } from '../common/s3/s3.service'
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator'

export enum FileType {
  RECEIPT = 'RECEIPT',
  PROFILE_PICTURE = 'PROFILE_PICTURE',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER'
}

class GenerateUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string

  @IsEnum(FileType)
  fileType!: FileType

  @IsOptional()
  @IsString()
  contentType?: string
}

@Controller('files')
export class FilesController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload-url')
  async generateUploadUrl(
    @Body() generateUploadUrlDto: GenerateUploadUrlDto,
    @Req() req?: any,
  ) {
    try {
      const { fileName, fileType, contentType } = generateUploadUrlDto
      
      // Generate unique key for the file
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const userId = req?.user?.id || 'temp'
      const key = `uploads/${fileType.toLowerCase()}/${userId}/${timestamp}-${randomId}-${fileName}`
      
      // Get S3 bucket from environment
      const bucket = process.env.S3_BUCKET || 'clubcorrarecieptsbucket'
      
      // Generate pre-signed URL
      const uploadUrl = await this.s3Service.generateUploadUrl({
        bucket,
        key,
        expiresInSeconds: 300, // 5 minutes
        contentType: contentType || 'application/octet-stream'
      })

      return {
        success: true,
        message: 'Upload URL generated successfully',
        data: {
          uploadUrl,
          key,
          bucket,
          expiresIn: 300
        }
      }
    } catch (error) {
      throw error
    }
  }

  @Post('download-url')
  async generateDownloadUrl(
    @Body() body: { key: string },
    @Req() req?: any,
  ) {
    try {
      const { key } = body
      
      // Get S3 bucket from environment
      const bucket = process.env.S3_BUCKET || 'clubcorrarecieptsbucket'
      
      // Generate download URL
      const downloadUrl = await this.s3Service.generateDownloadUrl({
        bucket,
        key,
        expiresInSeconds: 3600 // 1 hour
      })

      return {
        success: true,
        message: 'Download URL generated successfully',
        data: {
          downloadUrl,
          expiresIn: 3600
        }
      }
    } catch (error) {
      throw error
    }
  }
}
