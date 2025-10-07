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
exports.PendingTransactionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const pending_transaction_service_1 = require("../services/pending-transaction.service");
const coins_service_1 = require("../coins.service");
const create_pending_transaction_dto_1 = require("../dto/create-pending-transaction.dto");
const api_response_util_1 = require("../../common/utils/api-response.util");
let PendingTransactionController = class PendingTransactionController {
    constructor(pendingTransactionService, coinsService) {
        this.pendingTransactionService = pendingTransactionService;
        this.coinsService = coinsService;
    }
    /**
     * Create a pending transaction for unauthenticated users
     * This is called from the upload page before authentication
     */
    async createPendingTransaction(dto) {
        const pendingTransaction = await this.pendingTransactionService.createPendingTransaction(dto);
        return api_response_util_1.ApiResponseUtil.success(pendingTransaction, 'Pending transaction created successfully');
    }
    /**
     * Claim a pending transaction after authentication
     * This is called after successful login/signup
     */
    async claimPendingTransaction(req, dto) {
        const userId = req.user.id;
        // Get pending transaction
        const pendingTransaction = await this.pendingTransactionService.claimPendingTransaction(dto.sessionId, userId);
        if (!pendingTransaction) {
            return api_response_util_1.ApiResponseUtil.success(null, 'No pending transaction found');
        }
        // Create actual reward request with the pending transaction data
        const rewardRequest = await this.coinsService.createRewardRequest(userId, {
            brandId: pendingTransaction.brandId,
            billAmount: pendingTransaction.billAmount,
            billDate: new Date().toISOString(),
            receiptUrl: pendingTransaction.receiptUrl,
            coinsToRedeem: 0, // No redemption for unauthenticated users
        });
        return api_response_util_1.ApiResponseUtil.success({
            pendingTransaction,
            rewardRequest
        }, 'Pending transaction claimed and reward request created successfully');
    }
};
exports.PendingTransactionController = PendingTransactionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pending_transaction_dto_1.CreatePendingTransactionDto]),
    __metadata("design:returntype", Promise)
], PendingTransactionController.prototype, "createPendingTransaction", null);
__decorate([
    (0, common_1.Post)('claim'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_pending_transaction_dto_1.ClaimPendingTransactionDto]),
    __metadata("design:returntype", Promise)
], PendingTransactionController.prototype, "claimPendingTransaction", null);
exports.PendingTransactionController = PendingTransactionController = __decorate([
    (0, common_1.Controller)('transactions/pending'),
    __metadata("design:paramtypes", [pending_transaction_service_1.PendingTransactionService,
        coins_service_1.CoinsService])
], PendingTransactionController);
