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
exports.WaitlistController = void 0;
const common_1 = require("@nestjs/common");
const waitlist_service_1 = require("./waitlist.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
const class_validator_1 = require("class-validator");
class WaitlistEntryDto {
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WaitlistEntryDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WaitlistEntryDto.prototype, "source", void 0);
class UpdateWaitlistStatusDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateWaitlistStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWaitlistStatusDto.prototype, "adminNotes", void 0);
let WaitlistController = class WaitlistController {
    constructor(waitlistService) {
        this.waitlistService = waitlistService;
    }
    // Public endpoint for web app
    async createWaitlistEntry(body) {
        try {
            const result = await this.waitlistService.createWaitlistEntry(body);
            return {
                success: true,
                message: 'Successfully added to waitlist',
                data: {
                    id: result.id,
                    email: result.email,
                    status: result.status,
                    createdAt: result.createdAt,
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Admin endpoints
    async getAllWaitlistEntries(page = '1', limit = '50') {
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 50;
            const result = await this.waitlistService.getAllWaitlistEntries(pageNum, limitNum);
            return {
                success: true,
                message: 'Waitlist entries retrieved successfully',
                ...result
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getWaitlistStats() {
        try {
            const stats = await this.waitlistService.getWaitlistStats();
            return {
                success: true,
                message: 'Waitlist stats retrieved successfully',
                data: stats
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.WaitlistController = WaitlistController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WaitlistEntryDto]),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "createWaitlistEntry", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Get)('admin/entries'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "getAllWaitlistEntries", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Get)('admin/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "getWaitlistStats", null);
exports.WaitlistController = WaitlistController = __decorate([
    (0, common_1.Controller)('waitlist'),
    __metadata("design:paramtypes", [waitlist_service_1.WaitlistService])
], WaitlistController);
