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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
const admin_service_1 = require("../admin.service");
class CreateAdminDto {
}
class UpdateAdminDto {
}
class UpdatePasswordDto {
}
let AdminUsersController = class AdminUsersController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getAllAdmins() {
        return this.adminService.findAll();
    }
    async getAdminById(id) {
        return this.adminService.findById(id);
    }
    async createAdmin(createAdminDto) {
        return this.adminService.createAdmin(createAdminDto);
    }
    async updateAdmin(id, updateAdminDto) {
        return this.adminService.updateAdmin(id, updateAdminDto);
    }
    async updatePassword(id, updatePasswordDto) {
        // This would need additional validation logic
        throw new common_1.BadRequestException('Password update not implemented yet');
    }
    async deleteAdmin(id) {
        await this.adminService.deleteAdmin(id);
        return { message: 'Admin deleted successfully' };
    }
    async getAdminStats() {
        const admins = await this.adminService.findAll();
        const activeAdmins = admins.filter(admin => admin.isActive === true);
        const inactiveAdmins = admins.filter(admin => admin.isActive === false);
        return {
            totalAdmins: admins.length,
            activeAdmins: activeAdmins.length,
            inactiveAdmins: inactiveAdmins.length,
            roles: {
                superAdmin: admins.filter(admin => admin.role === 'SUPER_ADMIN').length,
                admin: admins.filter(admin => admin.role === 'ADMIN').length,
            }
        };
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getAllAdmins", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getAdminById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAdminDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAdminDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Put)(':id/password'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdatePasswordDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "deleteAdmin", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getAdminStats", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('admin/admins'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminUsersController);
