import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CoinsService } from '../coins.service'
import { CreateRewardRequestDto } from '../dto/create-reward-request.dto'
import { AuthenticatedRequest } from '../../common/types/authenticated-request.type'

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get()
  async getUserTransactions(
    @Req() req: AuthenticatedRequest,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const userId = req.user.id
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 20
    return this.coinsService.getAllTransactions(pageNum, limitNum, { userId })
  }

  @Post('reward-request')
  async createRewardRequest(@Req() req: AuthenticatedRequest, @Body() body: CreateRewardRequestDto) {
    const userId = req.user.id
    return this.coinsService.createRewardRequest(userId, body)
  }
}
