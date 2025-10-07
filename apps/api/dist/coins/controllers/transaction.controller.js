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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const coins_service_1 = require("../coins.service");
const create_reward_request_dto_1 = require("../dto/create-reward-request.dto");
let TransactionController = class TransactionController {
    constructor(coinsService) {
        this.coinsService = coinsService;
    }
    async createRewardRequest(createRewardRequestDto, req) {
        // Handle both authenticated and unauthenticated users
        const userId = req?.user?.id || createRewardRequestDto.tempUserId || `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        return this.coinsService.createRewardRequest(userId, createRewardRequestDto);
    }
    async getUserTransactions(page = 1, limit = 20, status, type, brandId, req) {
        const userId = req.user.id;
        const filters = { status, type, brandId, userId };
        return this.coinsService.getAllTransactions(page, limit, filters);
    }
    async getMyTransactions(page = 1, limit = 20, status, type, req) {
        const userId = req.user.id;
        const filters = { status, type, userId };
        return this.coinsService.getAllTransactions(page, limit, filters);
    }
    async getTransactionById(id, req) {
        const userId = req.user.id;
        const transaction = await this.coinsService.getTransactionById(id);
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        // Ensure user can only access their own transactions
        if (transaction.user && transaction.user.id !== userId) {
            throw new common_1.UnauthorizedException('Unauthorized access to transaction');
        }
        return transaction;
    }
    async associateTempTransaction(tempTransactionId, req) {
        const userId = req.user.id;
        const transaction = await this.coinsService.associateTempTransactionWithUser(tempTransactionId, userId);
        return {
            success: true,
            message: 'Temporary transaction associated successfully',
            data: transaction
        };
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Post)('rewards'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reward_request_dto_1.CreateRewardRequestDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "createRewardRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('brandId')),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getUserTransactions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getMyTransactions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('associate-temp/:tempTransactionId'),
    __param(0, (0, common_1.Param)('tempTransactionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "associateTempTransaction", null);
exports.TransactionController = TransactionController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [coins_service_1.CoinsService])
], TransactionController);
