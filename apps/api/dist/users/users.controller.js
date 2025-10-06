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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
const users_service_1 = require("./users.service");
const user_search_dto_1 = require("./dto/user-search.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async list(searchDto) {
        const result = await this.usersService.findAll(searchDto.page, searchDto.limit, searchDto);
        return {
            success: true,
            message: 'Users fetched successfully',
            data: result
        };
    }
    async stats() {
        const result = await this.usersService.getUserStats();
        return {
            success: true,
            message: 'User stats fetched successfully',
            data: result
        };
    }
    async search(query, page = 1, limit = 20) {
        return this.usersService.searchUsers(query, page, limit);
    }
    async getNewUsers(days = 30, page = 1, limit = 20) {
        return this.usersService.getNewUsers(days, page, limit);
    }
    async getGrowthStats(days = 30) {
        return this.usersService.getUserGrowthStats(days);
    }
    async exportUsers(status, startDate, endDate) {
        const filters = { status, startDate, endDate };
        return this.usersService.exportUsers(filters);
    }
    async get(id) {
        const result = await this.usersService.findById(id);
        return {
            success: true,
            message: 'User fetched successfully',
            data: result
        };
    }
    async getActivity(id) {
        return this.usersService.getUserActivity(id);
    }
    async getTransactions(id, page = 1, limit = 20) {
        return this.usersService.getUserTransactionHistory(id, page, limit);
    }
    async getBalance(id) {
        const result = await this.usersService.getUserBalance(id);
        return {
            success: true,
            message: 'User balance fetched successfully',
            data: { balance: result }
        };
    }
    async updateProfile(id, body) {
        const result = await this.usersService.updateProfile(id, body);
        return {
            success: true,
            message: 'User profile updated successfully',
            data: result
        };
    }
    async updateEmail(id, body) {
        const result = await this.usersService.updateEmail(id, body.email);
        return {
            success: true,
            message: 'User email updated successfully',
            data: result
        };
    }
    async updateStatus(id, body) {
        const result = await this.usersService.updateUserStatus(id, body.status);
        return {
            success: true,
            message: 'User status updated successfully',
            data: result
        };
    }
    async updatePaymentDetails(id, body) {
        return this.usersService.updatePaymentDetails(id, body);
    }
    async createUser(body) {
        const result = await this.usersService.createUser(body);
        return {
            success: true,
            message: 'User created successfully',
            data: result
        };
    }
    async adjustUserCoins(id, body) {
        const result = await this.usersService.adjustUserCoins(id, body);
        return {
            success: true,
            message: 'User coins adjusted successfully',
            data: result
        };
    }
    async deleteUser(id) {
        const result = await this.usersService.deleteUser(id);
        return {
            success: true,
            message: 'User deleted successfully',
            data: result
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_search_dto_1.UserSearchDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('new'),
    __param(0, (0, common_1.Query)('days')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getNewUsers", null);
__decorate([
    (0, common_1.Get)('growth'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getGrowthStats", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/activity'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getActivity", null);
__decorate([
    (0, common_1.Get)(':id/transactions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Patch)(':id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)(':id/email'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserEmailDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateEmail", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/payment-details'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdatePaymentDetailsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePaymentDetails", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)(':id/coins'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "adjustUserCoins", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('admin/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
