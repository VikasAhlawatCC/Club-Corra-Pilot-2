import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { FilesService } from '../../files/files.service'
import { CoinsService } from '../coins.service'
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

  @Post('reward-request')
  async createPublicRewardRequest(@Body() body: CreatePublicRewardRequestDto) {
    try {
      // For unauthenticated users, we'll store the request temporarily
      // and associate it with the user after they log in
      const tempUserId = 'temp_' + Date.now() // Temporary ID for unauthenticated requests
      
      const createRewardRequestDto: CreateRewardRequestDto = {
        brandId: body.brandId,
        billAmount: body.billAmount,
        billDate: body.billDate,
        receiptUrl: body.receiptUrl,
        coinsToRedeem: body.coinsToRedeem || 0,
      }

      // Create the reward request with temporary user ID
      const result = await this.coinsService.createRewardRequest(tempUserId, createRewardRequestDto)

      return {
        success: true,
        message: 'Reward request submitted successfully. Please log in to complete the process.',
        data: {
          tempTransactionId: result.transaction.id,
          requiresLogin: true,
          redirectUrl: '/login',
        }
      }
    } catch (error) {
      throw error
    }
  }

  @Get('brands')
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
      }
    } catch (error) {
      throw error
    }
  }
}
