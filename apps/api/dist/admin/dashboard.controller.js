"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async metrics(req) {
        const adminId = req.user.id;
        return this.dashboardService.getDashboardMetrics(adminId);
    }
    realtimeMetrics() {
        return this.dashboardService.getRealtimeMetrics();
    }
    async getTransactionTrends(period = '30d') {
        return this.dashboardService.getTransactionTrends(period);
    }
    async getUserGrowthTrends(period = '30d') {
        return this.dashboardService.getUserGrowthTrends(period);
    }
    async getBrandPerformanceAnalytics(period = '30d') {
        return this.dashboardService.getBrandPerformanceAnalytics(period);
    }
    async getSavedViews(req) {
        const adminId = req.user.id;
        return this.dashboardService.getSavedViews(adminId);
    }
    async getRiskSignals(page = 1, limit = 20) {
        return this.dashboardService.getRiskSignals(page, limit);
    }
    async getActiveExperiments() {
        return this.dashboardService.getActiveExperiments();
    }
    async getFinancialReconciliation() {
        return this.dashboardService.getFinancialReconciliation();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "metrics", null);
__decorate([
    (0, common_1.Get)('metrics/realtime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "realtimeMetrics", null);
__decorate([
    (0, common_1.Get)('trends/transactions'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTransactionTrends", null);
__decorate([
    (0, common_1.Get)('trends/users'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUserGrowthTrends", null);
__decorate([
    (0, common_1.Get)('analytics/brands'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getBrandPerformanceAnalytics", null);
__decorate([
    (0, common_1.Get)('saved-views'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSavedViews", null);
__decorate([
    (0, common_1.Get)('risk-signals'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRiskSignals", null);
__decorate([
    (0, common_1.Get)('experiments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getActiveExperiments", null);
__decorate([
    (0, common_1.Get)('financial-reconciliation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getFinancialReconciliation", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('admin/dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
