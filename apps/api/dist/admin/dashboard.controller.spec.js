"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
describe('DashboardController', () => {
    let controller;
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [dashboard_controller_1.DashboardController],
            providers: [
                {
                    provide: dashboard_service_1.DashboardService,
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
        controller = module.get(dashboard_controller_1.DashboardController);
        service = module.get(dashboard_service_1.DashboardService);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    it('should call getDashboardMetrics', async () => {
        const mockMetrics = {
            userMetrics: {
                totalUsers: 100,
                activeUsers: 50,
                newUsers: 10
            },
            transactionMetrics: {
                totalTransactions: 500,
                pendingTransactions: 25,
                totalValue: 10000
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
