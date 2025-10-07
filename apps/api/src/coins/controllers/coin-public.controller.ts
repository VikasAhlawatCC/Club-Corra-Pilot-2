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
  async createPublicRewardRequest(@Body() body: any) {
    try {
      // For now, return a simple success response to test the endpoint
      // This will help us isolate whether the issue is with the endpoint or database operations
      console.log('Received reward request:', body);
      
      return {
        success: true,
        message: 'Reward request submitted successfully. Please log in to complete the process.',
        data: {
          tempTransactionId: 'temp_' + Date.now(),
          requiresLogin: true,
          redirectUrl: '/login',
        }
      }
    } catch (error) {
      console.error('Error creating reward request:', error);
      throw error
    }
  }

  @Post()
  async createWebappRewardRequest(@Body() body: any) {
    try {
      // For now, return a simple success response to test the endpoint
      // This will help us isolate whether the issue is with the endpoint or database operations
      console.log('Received request:', body);
      
      return {
        message: 'Reward request submitted successfully.',
        transaction: {
          id: 'temp_' + Date.now(),
          brandId: body.brandId,
          billAmount: body.billAmount,
          coinsRedeemed: body.coinsRedeemed || 0,
          receiptUrl: body.receiptUrl,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        tempTransactionId: 'temp_' + Date.now(),
      }
    } catch (error) {
      console.error('Error creating reward request:', error);
      throw error
    }
  }

  @Post('simple-test')
  async simpleTest(@Body() body: any) {
    return { message: 'Simple test endpoint works', received: body };
  }

  @Get('brands')
  async getActiveBrands() {
    try {
      // This would typically come from a brands service
      // For now, return a placeholder response with proper UUIDs
      return {
        success: true,
        message: 'Active brands retrieved successfully',
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
    } catch (error) {
      throw error
    }
  }
}
