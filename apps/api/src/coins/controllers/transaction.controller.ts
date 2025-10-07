import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CoinsService } from '../coins.service'
import { CreateRewardRequestDto } from '../dto/create-reward-request.dto'

@Controller('transactions')
export class TransactionController {
  constructor(private readonly coinsService: CoinsService) {}

  @Post('rewards')
  async createRewardRequest(
    @Body() createRewardRequestDto: CreateRewardRequestDto,
    @Req() req?: any,
  ) {
    // Handle both authenticated and unauthenticated users
    const userId = req?.user?.id || createRewardRequestDto.tempUserId || `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    return this.coinsService.createRewardRequest(userId, createRewardRequestDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('brandId') brandId?: string,
    @Req() req?: any,
  ) {
    const userId = req.user.id
    const filters = { status, type, brandId, userId }
    return this.coinsService.getAllTransactions(page, limit, filters)
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Req() req?: any,
  ) {
    const userId = req.user.id
    const filters = { status, type, userId }
    return this.coinsService.getAllTransactions(page, limit, filters)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTransactionById(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = req.user.id
    const transaction = await this.coinsService.getTransactionById(id)
    
    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }

    // Ensure user can only access their own transactions
    if (transaction.user && transaction.user.id !== userId) {
      throw new UnauthorizedException('Unauthorized access to transaction')
    }

    return transaction
  }

  @UseGuards(JwtAuthGuard)
  @Post('associate-temp/:tempTransactionId')
  async associateTempTransaction(
    @Param('tempTransactionId') tempTransactionId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id
    const transaction = await this.coinsService.associateTempTransactionWithUser(tempTransactionId, userId)
    
    return {
      success: true,
      message: 'Temporary transaction associated successfully',
      data: transaction
    }
  }
}
