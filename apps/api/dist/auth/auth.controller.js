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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
const user_guard_1 = require("../common/guards/user.guard");
const class_validator_1 = require("class-validator");
const user_login_dto_1 = require("./dto/user-login.dto");
const users_service_1 = require("../users/users.service");
class AdminLoginDto {
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "password", void 0);
class UpdateUpiIdDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUpiIdDto.prototype, "upiId", void 0);
let AuthController = class AuthController {
    constructor(authService, usersService) {
        this.authService = authService;
        this.usersService = usersService;
    }
    // Admin endpoints
    async adminLogin(body) {
        try {
            const result = await this.authService.adminLogin(body);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async adminVerify(req) {
        return this.authService.adminVerify(req.user);
    }
    // User endpoints
    async userLoginSignup(body) {
        try {
            const result = await this.authService.userLoginSignup(body);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async userVerifyOtp(body) {
        try {
            const result = await this.authService.userVerifyOtp(body);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async userVerify(req) {
        return this.authService.userVerify(req.user);
    }
    async updateUpiId(req, body) {
        try {
            const result = await this.usersService.updatePaymentDetails(req.user.id, { upiId: body.upiId });
            return {
                success: true,
                message: 'UPI ID updated successfully',
                data: result
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Post)('admin/verify'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminVerify", null);
__decorate([
    (0, common_1.Post)('login-signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_login_dto_1.UserLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "userLoginSignup", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_login_dto_1.UserVerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "userVerifyOtp", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, user_guard_1.UserGuard),
    (0, common_1.Post)('user/verify'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "userVerify", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, user_guard_1.UserGuard),
    (0, common_1.Patch)('user/upi-id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateUpiIdDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUpiId", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService])
], AuthController);
