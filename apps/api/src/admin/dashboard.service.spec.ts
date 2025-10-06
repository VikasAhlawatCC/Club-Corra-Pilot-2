import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardMetricsCache } from './entities/dashboard-metrics-cache.entity';
import { SavedView } from './entities/saved-view.entity';
import { RiskSignal } from './entities/risk-signal.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ExperimentConfig } from './entities/experiment-config.entity';
import { FinancialReconciliation } from './entities/financial-reconciliation.entity';
import { User } from '../users/entities/user.entity';
import { CoinTransaction } from '../coins/entities/coin-transaction.entity';
import { Brand } from '../brands/entities/brand.entity';
import { CoinBalance } from '../coins/entities/coin-balance.entity';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(DashboardMetricsCache),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SavedView),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RiskSignal),
          useValue: {
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ExperimentConfig),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FinancialReconciliation),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CoinTransaction),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Brand),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CoinBalance),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get dashboard metrics', async () => {
    const mockMetrics = {
      userMetrics: {
        totalUsers: 100,
        activeUsers: 50,
        newUsers: 10
      },
      transactionMetrics: {
        totalTransactions: 200,
        pendingTransactions: 10,
        totalValue: 5000
      },
      brandMetrics: {
        totalBrands: 20,
        activeBrands: 18
      },
      systemMetrics: {
        uptime: 99.9,
        lastUpdate: new Date().toISOString()
      },
      financialMetrics: {
        totalCoins: 50000,
        totalValue: 10000
      }
    };

    jest.spyOn(service, 'getDashboardMetrics').mockResolvedValue(mockMetrics);

    const result = await service.getDashboardMetrics('admin-1');
    expect(result).toEqual(mockMetrics);
  });

  it('should get realtime metrics', async () => {
    const mockRealtime = {
      recentTransactions: 5,
      recentUsers: 10,
      activeConnections: 15,
      systemHealth: 'HEALTHY',
      lastUpdated: new Date().toISOString(),
    };

    jest.spyOn(service, 'getRealtimeMetrics').mockResolvedValue(mockRealtime);

    const result = await service.getRealtimeMetrics();
    expect(result).toEqual(mockRealtime);
  });
});