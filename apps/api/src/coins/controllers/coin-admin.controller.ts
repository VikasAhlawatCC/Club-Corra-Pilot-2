import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { CoinsService } from '../coins.service'

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
    const filters = { status, type, brandId, userId };
    return this.coinsService.getAllTransactions(page, limit, filters);
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

  @Put('transactions/:id/approve')
  async approveTransaction(
    @Param('id') id: string,
    @Body() body: { adminNotes?: string },
    @Req() req: any,
  ) {
    const adminUserId = req.user.id;
    return this.coinsService.approveTransaction(id, adminUserId, body.adminNotes);
  }

  @Put('transactions/:id/reject')
  async rejectTransaction(
    @Param('id') id: string,
    @Body() body: { adminNotes: string },
    @Req() req: any,
  ) {
    const adminUserId = req.user.id;
    return this.coinsService.rejectTransaction(id, adminUserId, body.adminNotes);
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
    return this.coinsService.getTransactionStats();
  }

  @Get('stats/transactions')
  async getTransactionStats() {
    return this.coinsService.getTransactionStats();
  }
}


