import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getDashboardMetrics: jest.fn(),
            getRealtimeMetrics: jest.fn(),
            getTransactionTrends: jest.fn(),
            getUserGrowthTrends: jest.fn(),
            getBrandPerformanceAnalytics: jest.fn(),
            getSavedViews: jest.fn(),
            getRiskSignals: jest.fn(),
            getActiveExperiments: jest.fn(),
            getFinancialReconciliation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getDashboardMetrics', async () => {
    const mockMetrics = { totalUsers: 100, activeUsers: 50 };
    jest.spyOn(service, 'getDashboardMetrics').mockResolvedValue(mockMetrics);

    const req = { user: { id: 'admin-1' } };
    const result = await controller.metrics(req);

    expect(service.getDashboardMetrics).toHaveBeenCalledWith('admin-1');
    expect(result).toEqual(mockMetrics);
  });

  it('should call getRealtimeMetrics', async () => {
    const mockRealtime = { 
      recentTransactions: 5,
      recentUsers: 10,
      activeConnections: 15,
      systemHealth: 'HEALTHY',
      lastUpdated: new Date().toISOString()
    };
    jest.spyOn(service, 'getRealtimeMetrics').mockResolvedValue(mockRealtime);

    const result = await controller.realtimeMetrics();

    expect(service.getRealtimeMetrics).toHaveBeenCalled();
    expect(result).toEqual(mockRealtime);
  });
});