import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { CoinsService } from '../coins.service'
import { TransactionApprovalDto, TransactionRejectionDto, MarkAsPaidDto } from '../dto/reward-request-response.dto'

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/coins')
export class CoinAdminController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get('transactions')
  async getTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('brandId') brandId?: string,
    @Query('userId') userId?: string,
  ) {
    try {
      const filters = { status, type, brandId, userId };
      return this.coinsService.getAllTransactions(page, limit, filters);
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return {
        success: false,
        message: 'Failed to fetch transactions',
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };
    }
  }

  @Get('transactions/pending')
  async getPendingTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.coinsService.getPendingTransactions(page, limit);
  }

  @Get('transactions/:id')
  async getTransactionById(@Param('id') id: string) {
    const transaction = await this.coinsService.getTransactionById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction;
  }

  @Post('transactions/:id/approve')
  async approveTransaction(
    @Param('id') id: string,
    @Body() approvalDto: TransactionApprovalDto,
    @Req() req: any,
  ) {
    return this.coinsService.approveTransaction(id, req.user.id, approvalDto.adminNotes);
  }

  @Post('transactions/:id/reject')
  async rejectTransaction(
    @Param('id') id: string,
    @Body() rejectionDto: TransactionRejectionDto,
    @Req() req: any,
  ) {
    return this.coinsService.rejectTransaction(id, req.user.id, rejectionDto.reason);
  }


  @Post('users/:userId/adjust')
  async adjustUserBalance(
    @Param('userId') userId: string,
    @Body() body: { delta: number; reason?: string },
  ) {
    return this.coinsService.adminAdjustUserBalance(userId, body.delta, body.reason);
  }

  @Get('stats')
  async getStats() {
    return this.coinsService.getCoinSystemStats();
  }

  @Get('stats/transactions')
  async getTransactionStats() {
    return this.coinsService.getTransactionStats();
  }

  @Post('transactions/earn')
  async createEarnTransaction(
    @Body() body: { userId: string; brandId: string; billAmount: number },
  ) {
    return this.coinsService.createEarnTransaction(body.userId, body.brandId, body.billAmount);
  }

  @Post('transactions/redeem')
  async createRedeemTransaction(
    @Body() body: { userId: string; brandId: string; billAmount: number },
  ) {
    return this.coinsService.createRedeemTransaction(body.userId, body.brandId, body.billAmount);
  }

  @Get('balance/:userId')
  async getUserBalance(@Param('userId') userId: string) {
    const balance = await this.coinsService.getUserBalance(userId);
    return {
      success: true,
      message: 'User balance fetched successfully',
      data: { balance }
    };
  }
}


