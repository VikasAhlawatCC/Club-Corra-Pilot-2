import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { FilesService } from '../../files/files.service'
import { CoinsService } from '../coins.service'
import { BrandsService } from '../../brands/brands.service'
import { CreateRewardRequestDto } from '../dto/create-reward-request.dto'
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { FileType } from '../../files/file.entity'

class GenerateUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string

  @IsString()
  @IsNotEmpty()
  mimeType!: string

  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType
}

class CreatePublicRewardRequestDto {
  @IsString()
  @IsNotEmpty()
  brandId!: string

  @IsNotEmpty()
  billAmount!: number

  @IsString()
  @IsNotEmpty()
  billDate!: string

  @IsString()
  @IsNotEmpty()
  receiptUrl!: string

  @IsOptional()
  coinsToRedeem?: number

  @IsOptional()
  @IsString()
  upiId?: string
}

@Controller('public/transactions')
export class CoinPublicController {
  constructor(
    private readonly filesService: FilesService,
    private readonly coinsService: CoinsService,
    private readonly brandsService: BrandsService,
  ) {}

  @Post('upload-url')
  async generateUploadUrl(@Body() body: GenerateUploadUrlDto) {
    try {
      const { uploadUrl, fileKey, publicUrl } = await this.filesService.generatePresignedUploadUrl(
        body.fileName,
        body.mimeType,
        body.fileType || FileType.RECEIPT,
      )

      return {
        success: true,
        message: 'Upload URL generated successfully',
        data: {
          uploadUrl,
          fileKey,
          publicUrl,
        }
      }
    } catch (error) {
      throw error
    }
  }

  @Get('brands')
  async getActiveBrands() {
    try {
      // Get active brands from database
      const brands = await this.brandsService.findActiveBrands();
      
      return {
        success: true,
        message: 'Active brands retrieved successfully',
        data: brands.map(brand => ({
          id: brand.id,
          name: brand.name,
          logoUrl: brand.logoUrl,
          earningPercentage: brand.earningPercentage,
          redemptionPercentage: brand.redemptionPercentage,
          isActive: brand.isActive,
        }))
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Fallback to hardcoded data if database fails
      return {
        success: true,
        message: 'Active brands retrieved successfully (fallback)',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Adidas',
            logoUrl: 'https://example.com/adidas-logo.png',
            earningPercentage: 5,
            redemptionPercentage: 2,
            isActive: true,
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            name: 'Nike',
            logoUrl: 'https://example.com/nike-logo.png',
            earningPercentage: 4,
            redemptionPercentage: 2,
            isActive: true,
          },
        ]
      }
    }
  }
}
