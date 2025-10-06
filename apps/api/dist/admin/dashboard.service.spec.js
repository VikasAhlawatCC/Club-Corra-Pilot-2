"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_metrics_cache_entity_1 = require("./entities/dashboard-metrics-cache.entity");
const saved_view_entity_1 = require("./entities/saved-view.entity");
const risk_signal_entity_1 = require("./entities/risk-signal.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const experiment_config_entity_1 = require("./entities/experiment-config.entity");
const financial_reconciliation_entity_1 = require("./entities/financial-reconciliation.entity");
const user_entity_1 = require("../users/entities/user.entity");
const coin_transaction_entity_1 = require("../coins/entities/coin-transaction.entity");
const brand_entity_1 = require("../brands/entities/brand.entity");
const coin_balance_entity_1 = require("../coins/entities/coin-balance.entity");
describe('DashboardService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                dashboard_service_1.DashboardService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(dashboard_metrics_cache_entity_1.DashboardMetricsCache),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(saved_view_entity_1.SavedView),
                    useValue: {
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(risk_signal_entity_1.RiskSignal),
                    useValue: {
                        findAndCount: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(audit_log_entity_1.AuditLog),
                    useValue: {
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(experiment_config_entity_1.ExperimentConfig),
                    useValue: {
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(financial_reconciliation_entity_1.FinancialReconciliation),
                    useValue: {
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: {
                        count: jest.fn(),
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(coin_transaction_entity_1.CoinTransaction),
                    useValue: {
                        count: jest.fn(),
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(brand_entity_1.Brand),
                    useValue: {
                        count: jest.fn(),
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(coin_balance_entity_1.CoinBalance),
                    useValue: {
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();
        service = module.get(dashboard_service_1.DashboardService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should get dashboard metrics', async () => {
        const mockMetrics = {
            totalUsers: 100,
            activeUsers: 50,
            totalTransactions: 200,
            pendingTransactions: 10,
            totalRevenue: 5000,
            monthlyGrowth: 5.5,
            userGrowth: 3.2,
            transactionGrowth: 8.1,
            revenueGrowth: 12.3,
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
