import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'
import { DashboardService } from './dashboard.service'

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async metrics(@Req() req: any) {
    const adminId = req.user.id;
    return this.dashboardService.getDashboardMetrics(adminId);
  }

  @Get('metrics/realtime')
  realtimeMetrics() {
    return this.dashboardService.getRealtimeMetrics();
  }

  @Get('trends/transactions')
  async getTransactionTrends(@Query('period') period: string = '30d') {
    return this.dashboardService.getTransactionTrends(period);
  }

  @Get('trends/users')
  async getUserGrowthTrends(@Query('period') period: string = '30d') {
    return this.dashboardService.getUserGrowthTrends(period);
  }

  @Get('analytics/brands')
  async getBrandPerformanceAnalytics(@Query('period') period: string = '30d') {
    return this.dashboardService.getBrandPerformanceAnalytics(period);
  }

  @Get('analytics/transactions/trends')
  async getTransactionTrendsAnalytics(@Query('period') period: string = '7d') {
    return this.dashboardService.getTransactionTrends(period);
  }

  @Get('analytics/users/growth-trends')
  async getUserGrowthTrendsAnalytics(@Query('period') period: string = '7d') {
    return this.dashboardService.getUserGrowthTrends(period);
  }

  @Get('analytics/brands/performance')
  async getBrandPerformanceAnalyticsEndpoint(@Query('period') period: string = '30d') {
    return this.dashboardService.getBrandPerformanceAnalytics(period);
  }

  @Get('saved-views')
  async getSavedViews(@Req() req: any) {
    const adminId = req.user.id;
    return this.dashboardService.getSavedViews(adminId);
  }

  @Get('risk-signals')
  async getRiskSignals(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.dashboardService.getRiskSignals(page, limit);
  }

  @Get('experiments')
  async getActiveExperiments() {
    return this.dashboardService.getActiveExperiments();
  }

  @Get('financial-reconciliation')
  async getFinancialReconciliation() {
    return this.dashboardService.getFinancialReconciliation();
  }
}


