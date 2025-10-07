import { Controller, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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

  @Post('test')
  async test() {
    return {
      success: true,
      message: 'Files controller is working'
    }
  }

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

  @Post('configure-cors')
  async configureCors() {
    try {
      const bucket = process.env.S3_BUCKET || 'clubcorrarecieptsbucket'
      await this.s3Service.configureCors(bucket)
      
      return {
        success: true,
        message: 'CORS configuration updated successfully'
      }
    } catch (error) {
      throw error
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body() body: { fileName?: string; mimeType?: string }
  ) {
    try {
      if (!file) {
        throw new Error('No file provided')
      }

      const fileName = body.fileName || file.originalname
      const mimeType = body.mimeType || file.mimetype
      
      // Generate unique key for the file
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileExtension = fileName.split('.').pop() || ''
      const key = `uploads/receipt/${timestamp}-${randomId}.${fileExtension}`
      
      // Get S3 bucket from environment
      const bucket = process.env.S3_BUCKET || 'clubcorrarecieptsbucket'
      
      // Upload file to S3
      const uploadUrl = await this.s3Service.generateUploadUrl({
        bucket,
        key,
        expiresInSeconds: 300,
        contentType: mimeType
      })

      // Upload the file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file.buffer,
        headers: {
          'Content-Type': mimeType,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3')
      }

      const region = process.env.S3_REGION || 'eu-north-1'
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

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
      }
    } catch (error) {
      throw error
    }
  }
}
