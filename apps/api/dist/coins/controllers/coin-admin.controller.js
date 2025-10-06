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
exports.CoinAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
const coins_service_1 = require("../coins.service");
const reward_request_response_dto_1 = require("../dto/reward-request-response.dto");
let CoinAdminController = class CoinAdminController {
    constructor(coinsService) {
        this.coinsService = coinsService;
    }
    async getTransactions(page = 1, limit = 20, status, type, brandId, userId) {
        try {
            const filters = { status, type, brandId, userId };
            return this.coinsService.getAllTransactions(page, limit, filters);
        }
        catch (error) {
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
    async getPendingTransactions(page = 1, limit = 20) {
        return this.coinsService.getPendingTransactions(page, limit);
    }
    async getTransactionById(id) {
        const transaction = await this.coinsService.getTransactionById(id);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return transaction;
    }
    async approveTransaction(id, approvalDto, req) {
        return this.coinsService.approveTransaction(id, req.user.id, approvalDto.adminNotes);
    }
    async rejectTransaction(id, rejectionDto, req) {
        return this.coinsService.rejectTransaction(id, req.user.id, rejectionDto.reason);
    }
    async adjustUserBalance(userId, body) {
        return this.coinsService.adminAdjustUserBalance(userId, body.delta, body.reason);
    }
    async getStats() {
        return this.coinsService.getCoinSystemStats();
    }
    async getTransactionStats() {
        return this.coinsService.getTransactionStats();
    }
    async createEarnTransaction(body) {
        return this.coinsService.createEarnTransaction(body.userId, body.brandId, body.billAmount);
    }
    async createRedeemTransaction(body) {
        return this.coinsService.createRedeemTransaction(body.userId, body.brandId, body.billAmount);
    }
    async getUserBalance(userId) {
        const balance = await this.coinsService.getUserBalance(userId);
        return {
            success: true,
            message: 'User balance fetched successfully',
            data: { balance }
        };
    }
};
exports.CoinAdminController = CoinAdminController;
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('brandId')),
    __param(5, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/pending'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "getPendingTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "getTransactionById", null);
__decorate([
    (0, common_1.Post)('transactions/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reward_request_response_dto_1.TransactionApprovalDto, Object]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "approveTransaction", null);
__decorate([
    (0, common_1.Post)('transactions/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reward_request_response_dto_1.TransactionRejectionDto, Object]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "rejectTransaction", null);
__decorate([
    (0, common_1.Post)('users/:userId/adjust'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "adjustUserBalance", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('stats/transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "getTransactionStats", null);
__decorate([
    (0, common_1.Post)('transactions/earn'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "createEarnTransaction", null);
__decorate([
    (0, common_1.Post)('transactions/redeem'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "createRedeemTransaction", null);
__decorate([
    (0, common_1.Get)('balance/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoinAdminController.prototype, "getUserBalance", null);
exports.CoinAdminController = CoinAdminController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('admin/coins'),
    __metadata("design:paramtypes", [coins_service_1.CoinsService])
], CoinAdminController);
