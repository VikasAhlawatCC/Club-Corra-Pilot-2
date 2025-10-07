import { Body, Controller, Post, Get, Query, UseGuards } from '@nestjs/common'
import { WaitlistService, CreateWaitlistEntryDto } from './waitlist.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

class WaitlistEntryDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsOptional()
  @IsString()
  source?: string
}

class UpdateWaitlistStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: string

  @IsOptional()
  @IsString()
  adminNotes?: string
}

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  // Public endpoint for web app
  @Post()
  async createWaitlistEntry(@Body() body: WaitlistEntryDto) {
    try {
      const result = await this.waitlistService.createWaitlistEntry(body)
      return {
        success: true,
        message: 'Successfully added to waitlist',
        data: {
          id: result.id,
          email: result.email,
          status: result.status,
          createdAt: result.createdAt,
        }
      }
    } catch (error) {
      throw error
    }
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/entries')
  async getAllWaitlistEntries(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    try {
      const pageNum = parseInt(page, 10) || 1
      const limitNum = parseInt(limit, 10) || 50
      
      const result = await this.waitlistService.getAllWaitlistEntries(pageNum, limitNum)
      return {
        success: true,
        message: 'Waitlist entries retrieved successfully',
        ...result
      }
    } catch (error) {
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats')
  async getWaitlistStats() {
    try {
      const stats = await this.waitlistService.getWaitlistStats()
      return {
        success: true,
        message: 'Waitlist stats retrieved successfully',
        data: stats
      }
    } catch (error) {
      throw error
    }
  }
}
