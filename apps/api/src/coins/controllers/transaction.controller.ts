import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CoinsService } from '../coins.service'
import { CreateRewardRequestDto } from '../dto/create-reward-request.dto'

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly coinsService: CoinsService) {}

  @Post('rewards')
  async createRewardRequest(
    @Body() createRewardRequestDto: CreateRewardRequestDto,
    @Req() req: any,
  ) {
    const userId = req.user.id
    return this.coinsService.createRewardRequest(userId, createRewardRequestDto)
  }

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

  @Get(':id')
  async getTransactionById(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = req.user.id
    const transaction = await this.coinsService.getTransactionById(id)
    
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    // Ensure user can only access their own transactions
    if (transaction.user && transaction.user.id !== userId) {
      throw new Error('Unauthorized access to transaction')
    }

    return transaction
  }
}
