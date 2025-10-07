import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, LessThan, MoreThan } from 'typeorm';
import { DashboardMetricsCache } from './entities/dashboard-metrics-cache.entity';
import { SavedView } from './entities/saved-view.entity';
import { RiskSignal } from './entities/risk-signal.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ExperimentConfig } from './entities/experiment-config.entity';
import { FinancialReconciliation } from './entities/financial-reconciliation.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import { CoinTransaction } from '../coins/entities/coin-transaction.entity';
import { Brand } from '../brands/entities/brand.entity';
import { CoinBalance } from '../coins/entities/coin-balance.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DashboardMetricsCache)
    private dashboardMetricsCacheRepository: Repository<DashboardMetricsCache>,
    @InjectRepository(SavedView)
    private savedViewRepository: Repository<SavedView>,
    @InjectRepository(RiskSignal)
    private riskSignalRepository: Repository<RiskSignal>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(ExperimentConfig)
    private experimentConfigRepository: Repository<ExperimentConfig>,
    @InjectRepository(FinancialReconciliation)
    private financialReconciliationRepository: Repository<FinancialReconciliation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CoinTransaction)
    private coinTransactionRepository: Repository<CoinTransaction>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(CoinBalance)
    private coinBalanceRepository: Repository<CoinBalance>,
  ) {}

  async getDashboardMetrics(adminId: string) {
    try {
      // Calculate fresh metrics without caching for now
      const metrics = await this.calculateDashboardMetrics();
      return metrics;
    } catch (error) {
      console.error('Error calculating dashboard metrics:', error);
      // Return basic metrics if advanced calculations fail
      return {
        userMetrics: { totalUsers: 0, activeUsers: 0, newUsers: 0 },
        transactionMetrics: { totalTransactions: 0, pendingTransactions: 0, totalValue: 0 },
        brandMetrics: { totalBrands: 0, activeBrands: 0 },
        financialMetrics: { totalCoins: 0, totalValue: 0 },
        systemMetrics: { uptime: 0, lastUpdate: new Date().toISOString() }
      };
    }
  }

  private async calculateDashboardMetrics() {
    try {
      const [
        userMetrics,
        transactionMetrics,
        brandMetrics,
        financialMetrics
      ] = await Promise.all([
        this.calculateUserMetrics(),
        this.calculateTransactionMetrics(),
        this.calculateBrandMetrics(),
        this.calculateFinancialMetrics(),
      ]);

      return {
        userMetrics,
        transactionMetrics,
        brandMetrics,
        financialMetrics,
        systemMetrics: { uptime: 0, lastUpdate: new Date().toISOString() }
      };
    } catch (error) {
      console.error('Error in calculateDashboardMetrics:', error);
      throw error;
    }
  }

  private async calculateUserMetrics() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersThisWeek,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { createdAt: MoreThanOrEqual(monthStart) } }),
      this.userRepository.count({ where: { createdAt: MoreThanOrEqual(weekStart) } }),
    ]);

    const userGrowthRate = totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100) : 0;
    const averageUserRetention = 85; // Placeholder - would need more complex calculation

    const topUserSegments = [
      { segment: 'Active Users', count: activeUsers, percentage: (activeUsers / totalUsers) * 100, growthRate: 12.5 },
      { segment: 'New Users', count: newUsersThisMonth, percentage: (newUsersThisMonth / totalUsers) * 100, growthRate: 8.3 },
    ];

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      userGrowthRate,
      averageUserRetention,
      topUserSegments,
    };
  }

  private async calculateTransactionMetrics() {
    const [
      totalTransactions,
      pendingTransactions,
      approvedTransactions,
      rejectedTransactions,
      totalCoinsEarned,
      totalCoinsRedeemed,
      pendingEarnRequests,
      pendingRedeemRequests,
    ] = await Promise.all([
      this.coinTransactionRepository.count(),
      this.coinTransactionRepository.count({ where: { status: 'PENDING' } }),
      this.coinTransactionRepository.count({ where: { status: 'COMPLETED' } }),
      this.coinTransactionRepository.count({ where: { status: 'FAILED' } }),
      this.coinTransactionRepository
        .createQueryBuilder('t')
        .select('SUM(CAST(t.amount AS DECIMAL))', 'total')
        .where('t.type = :type', { type: 'EARN' })
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.coinTransactionRepository
        .createQueryBuilder('t')
        .select('SUM(CAST(t.amount AS DECIMAL))', 'total')
        .where('t.type = :type', { type: 'REDEEM' })
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.coinTransactionRepository.count({ 
        where: { 
          type: 'EARN',
          status: 'PENDING' 
        } 
      }),
      this.coinTransactionRepository.count({ 
        where: { 
          type: 'REDEEM',
          status: 'PENDING' 
        } 
      }),
    ]);

    const averageTransactionValue = totalTransactions > 0 ? (totalCoinsEarned + totalCoinsRedeemed) / totalTransactions : 0;
    const transactionSuccessRate = totalTransactions > 0 ? (approvedTransactions / totalTransactions) * 100 : 0;

    return {
      totalTransactions,
      pendingTransactions,
      approvedTransactions,
      rejectedTransactions,
      totalCoinsEarned,
      totalCoinsRedeemed,
      averageTransactionValue,
      transactionSuccessRate,
      pendingEarnRequests,
      pendingRedeemRequests,
    };
  }

  private async calculateBrandMetrics() {
    const [
      totalBrands,
      activeBrands,
    ] = await Promise.all([
      this.brandRepository.count(),
      this.brandRepository.count({ where: { isActive: true } }),
    ]);

    // Get top performing brands
    const topPerformingBrands = await this.coinTransactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.brand', 'b')
      .select([
        'b.id as brandId',
        'b.name as brandName',
        'COUNT(t.id) as transactionVolume',
        'AVG(CASE WHEN t.status = \'APPROVED\' THEN 1 ELSE 0 END) * 100 as successRate',
        'COUNT(DISTINCT t.userId) as userEngagement',
        'SUM(t.amount) as revenueContribution'
      ])
      .groupBy('b.id, b.name')
      .orderBy('transactionVolume', 'DESC')
      .limit(5)
      .getRawMany();

    const brandEngagementRate = totalBrands > 0 ? (activeBrands / totalBrands) * 100 : 0;
    const averageBrandTransactionVolume = totalBrands > 0 ? 
      (await this.coinTransactionRepository.count()) / totalBrands : 0;

    return {
      totalBrands,
      activeBrands,
      topPerformingBrands: topPerformingBrands.map(brand => ({
        brandId: brand.brandId,
        brandName: brand.brandName,
        transactionVolume: parseInt(brand.transactionVolume),
        successRate: parseFloat(brand.successRate),
        userEngagement: parseInt(brand.userEngagement),
        revenueContribution: parseFloat(brand.revenueContribution) || 0,
      })),
      brandEngagementRate,
      averageBrandTransactionVolume,
    };
  }

  private async calculateFinancialMetrics() {
    const [
      totalCoinsInCirculation,
      totalLiability,
      totalEarned,
      totalRedeemed,
      monthlyRevenue,
      averageRevenuePerUser,
      coinBreakageRate,
    ] = await Promise.all([
      this.coinBalanceRepository
        .createQueryBuilder('b')
        .select('SUM(b.balance)', 'total')
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.coinBalanceRepository
        .createQueryBuilder('b')
        .select('SUM(b.totalEarned)', 'total')
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.coinBalanceRepository
        .createQueryBuilder('b')
        .select('SUM(b.totalEarned)', 'total')
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.coinBalanceRepository
        .createQueryBuilder('b')
        .select('SUM(b.totalRedeemed)', 'total')
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      0, // Placeholder - would need actual revenue calculation
      0, // Placeholder - would need actual revenue calculation
      5.2, // Placeholder - would need actual breakage calculation
    ]);

    // Get settlement status
    const settlementStatus = await this.financialReconciliationRepository
      .createQueryBuilder('f')
      .select([
        'f.brandId',
        'f.brandName',
        'f.pendingAmount',
        'f.lastSettlementDate',
        'f.nextSettlementDate',
        'f.status'
      ])
      .where('f.status IN (:...statuses)', { statuses: ['pending', 'processing'] })
      .orderBy('f.pendingAmount', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalCoinsInCirculation,
      totalLiability,
      totalEarned,
      totalRedeemed,
      monthlyRevenue,
      averageRevenuePerUser,
      coinBreakageRate,
      settlementStatus: settlementStatus.map(s => ({
        brandId: s.brandId,
        brandName: s.brandName,
        pendingAmount: parseFloat(s.pendingAmount),
        lastSettlementDate: s.lastSettlementDate ? new Date(s.lastSettlementDate) : undefined,
        nextSettlementDate: new Date(s.nextSettlementDate),
        status: s.status,
      })),
    };
  }

  private async calculateSystemMetrics() {
    // These would typically come from system monitoring
    return {
      systemHealth: 'healthy',
      uptime: 99.9,
      activeConnections: 150,
      averageResponseTime: 120,
      errorRate: 0.1,
    };
  }

  // Saved Views Management
  async getSavedViews(userId: string) {
    return this.savedViewRepository.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  async createSavedView(userId: string, data: any) {
    const savedView = this.savedViewRepository.create({
      ...data,
      owner: { id: userId },
    });
    return this.savedViewRepository.save(savedView);
  }

  async updateSavedView(id: string, userId: string, data: any) {
    const savedView = await this.savedViewRepository.findOne({
      where: { id, owner: { id: userId } }
    });
    if (!savedView) {
      throw new Error('Saved view not found');
    }
    Object.assign(savedView, data);
    return this.savedViewRepository.save(savedView);
  }

  async deleteSavedView(id: string, userId: string) {
    const savedView = await this.savedViewRepository.findOne({
      where: { id, owner: { id: userId } }
    });
    if (!savedView) {
      throw new Error('Saved view not found');
    }
    await this.savedViewRepository.remove(savedView);
  }

  /**
   * Clear all dashboard metrics cache
   * Useful when data changes that affects dashboard metrics (e.g., brand deactivation)
   */
  async clearCache() {
    try {
      await this.dashboardMetricsCacheRepository.clear();
      console.log('Dashboard metrics cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear dashboard cache:', error);
      throw error;
    }
  }

  /**
   * Get real transaction trends data for charts
   */
  async getTransactionTrends(period: string = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    try {
      // Get daily transaction counts and values
      const dailyStats = await this.coinTransactionRepository
        .createQueryBuilder('transaction')
        .select([
          'DATE(transaction.createdAt) as date',
          'COUNT(transaction.id) as volume',
          'SUM(transaction.amount) as value'
        ])
        .where('transaction.createdAt >= :startDate', { startDate })
        .andWhere('transaction.createdAt <= :endDate', { endDate })
        .groupBy('DATE(transaction.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      // Fill in missing dates with 0 values
      const trends = [];
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const existingData = dailyStats.find(stat => stat.date === dateStr);
        trends.push({
          date: dateStr,
          volume: existingData ? parseInt(existingData.volume) : 0,
          value: existingData ? parseFloat(existingData.value) : 0
        });
      }

      // Calculate totals and growth rate
      const totalVolume = trends.reduce((sum, day) => sum + day.volume, 0);
      const totalValue = trends.reduce((sum, day) => sum + day.value, 0);
      
      // Calculate growth rate (comparing first half vs second half of period)
      const midPoint = Math.floor(days / 2);
      const firstHalfVolume = trends.slice(0, midPoint).reduce((sum, day) => sum + day.volume, 0);
      const secondHalfVolume = trends.slice(midPoint).reduce((sum, day) => sum + day.volume, 0);
      const growthRate = firstHalfVolume > 0 ? ((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100 : 0;

      return {
        period,
        trends,
        totalVolume,
        totalValue,
        growthRate: Math.round(growthRate * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get transaction trends:', error);
      throw error;
    }
  }

  /**
   * Get real user growth trends data for charts
   */
  async getUserGrowthTrends(period: string = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    try {
      // Get daily new user counts
      const dailyNewUsers = await this.userRepository
        .createQueryBuilder('user')
        .select([
          'DATE(user.createdAt) as date',
          'COUNT(user.id) as newUsers'
        ])
        .where('user.createdAt >= :startDate', { startDate })
        .andWhere('user.createdAt <= :endDate', { endDate })
        .groupBy('DATE(user.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      // Get total users at the start of the period
      const startTotalUsers = await this.userRepository.count({
        where: { createdAt: LessThan(startDate) }
      });

      // Fill in missing dates and calculate cumulative totals
      const trends = [];
      let cumulativeUsers = startTotalUsers;
      
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const existingData = dailyNewUsers.find(stat => stat.date === dateStr);
        const newUsers = existingData ? parseInt(existingData.newUsers) : 0;
        cumulativeUsers += newUsers;
        
        const growthRate = cumulativeUsers > 0 ? (newUsers / cumulativeUsers) * 100 : 0;
        
        trends.push({
          date: dateStr,
          newUsers,
          totalUsers: cumulativeUsers,
          growthRate: Math.round(growthRate * 100) / 100
        });
      }

      // Calculate totals and average growth rate
      const totalNewUsers = trends.reduce((sum, day) => sum + day.newUsers, 0);
      const averageGrowthRate = trends.reduce((sum, day) => sum + day.growthRate, 0) / trends.length;

      return {
        period,
        trends,
        totalNewUsers,
        averageGrowthRate: Math.round(averageGrowthRate * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get user growth trends:', error);
      throw error;
    }
  }

  /**
   * Get real brand performance data for charts
   */
  async getBrandPerformanceAnalytics(period: string = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    try {
      // Get brand performance metrics for the period
      const brandPerformance = await this.coinTransactionRepository
        .createQueryBuilder('transaction')
        .leftJoin('transaction.brand', 'brand')
        .select([
          'brand.id as brandId',
          'brand.name as brandName',
          'COUNT(transaction.id) as transactionVolume',
          'AVG(CASE WHEN transaction.status = \'APPROVED\' THEN 1 ELSE 0 END) * 100 as successRate',
          'COUNT(DISTINCT transaction.userId) as userEngagement',
          'SUM(transaction.amount) as revenueContribution',
          'AVG(transaction.amount) as avgTransactionValue'
        ])
        .where('transaction.createdAt >= :startDate', { startDate })
        .andWhere('transaction.createdAt <= :endDate', { endDate })
        .andWhere('brand.isActive = :isActive', { isActive: true })
        .groupBy('brand.id, brand.name')
        .orderBy('transactionVolume', 'DESC')
        .getRawMany();

      // Transform the data
      const performance = brandPerformance.map(brand => ({
        brandId: brand.brandId,
        brandName: brand.brandName,
        transactionVolume: parseInt(brand.transactionVolume),
        successRate: Math.round(parseFloat(brand.successRate) * 100) / 100,
        userEngagement: parseInt(brand.userEngagement),
        revenueContribution: parseFloat(brand.revenueContribution) || 0,
        avgTransactionValue: Math.round((parseFloat(brand.avgTransactionValue) || 0) * 100) / 100
      }));

      // Get top 5 performing brands
      const topPerformingBrands = performance
        .slice(0, 5)
        .map(brand => ({
          brandId: brand.brandId,
          brandName: brand.brandName,
          transactionVolume: brand.transactionVolume,
          successRate: brand.successRate,
          userEngagement: brand.userEngagement,
          revenueContribution: brand.revenueContribution
        }));

      return {
        period,
        performance,
        topPerformingBrands
      };
    } catch (error) {
      console.error('Failed to get brand performance analytics:', error);
      throw error;
    }
  }

  // Risk Signals Management (PLACEHOLDER - as requested)
  async getRiskSignals(page = 1, limit = 20, filters?: any) {
    // Placeholder implementation
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  async createRiskSignal(data: any) {
    // Placeholder implementation
    return { id: 'placeholder', ...data };
  }

  async updateRiskSignal(id: string, data: any) {
    // Placeholder implementation
    return { id, ...data };
  }

  // Audit Logging
  async logAction(userId: string, action: string, resource: string, resourceId?: string, details?: any, ipAddress?: string, userAgent?: string) {
    const auditLog = this.auditLogRepository.create({
      actor: { id: userId },
      action,
      details: details || {},
    });
    await this.auditLogRepository.save(auditLog);
  }

  // Experiment Management
  async getActiveExperiments() {
    return this.experimentConfigRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  // Financial Reconciliation
  async getFinancialReconciliation() {
    return this.financialReconciliationRepository.find({
      order: { pendingAmount: 'DESC' }
    });
  }

  // Realtime Metrics (for live dashboard updates)
  async getRealtimeMetrics() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    
    const [
      recentTransactions,
      recentUsers,
      activeConnections,
      systemHealth
    ] = await Promise.all([
      this.coinTransactionRepository.count({
        where: { createdAt: MoreThanOrEqual(lastHour) }
      }),
      this.userRepository.count({
        where: { createdAt: MoreThanOrEqual(lastHour) }
      }),
      // Placeholder for active connections
      Promise.resolve(150),
      // Placeholder for system health
      Promise.resolve('healthy')
    ]);

    return {
      recentTransactions,
      recentUsers,
      activeConnections,
      systemHealth,
      lastUpdated: now.toISOString()
    };
  }
}


