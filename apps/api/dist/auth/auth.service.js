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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const admin_entity_1 = require("../admin/entities/admin.entity");
const admin_service_1 = require("../admin/admin.service");
let AuthService = class AuthService {
    constructor(adminRepository, jwtService, adminService) {
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
        this.adminService = adminService;
    }
    async adminLogin({ email, password }) {
        try {
            // Check if email is from @clubcorra.com domain
            if (!email.endsWith('@clubcorra.com')) {
                throw new common_1.UnauthorizedException('Only @clubcorra.com emails are allowed for admin access');
            }
            // Find admin user by email in the admins table
            const adminUser = await this.adminRepository.findOne({ where: { email } });
            if (!adminUser) {
                throw new common_1.UnauthorizedException('Admin user not found');
            }
            // Check if admin is active
            if (adminUser.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Admin account is not active');
            }
            // Verify password
            const isPasswordValid = await this.adminService.verifyPassword(adminUser.id, password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            // Update last login
            await this.adminService.updateLastLogin(adminUser.id);
            // Generate JWT token
            const payload = { sub: adminUser.id, email: adminUser.email, role: adminUser.role };
            const accessToken = await this.jwtService.signAsync(payload);
            return {
                success: true,
                message: 'Admin login successful',
                data: {
                    user: {
                        id: adminUser.id,
                        email: adminUser.email,
                        firstName: adminUser.firstName || '',
                        lastName: adminUser.lastName || '',
                        role: adminUser.role,
                        permissions: adminUser.permissions ? JSON.parse(adminUser.permissions) : ['transactions', 'brands', 'categories', 'users', 'coins', 'payments'],
                        status: adminUser.status,
                    },
                    accessToken,
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    async adminVerify(user) {
        try {
            if (!user || !user.id) {
                throw new common_1.UnauthorizedException('Invalid user token');
            }
            const adminUser = await this.adminService.findById(user.id);
            if (!adminUser) {
                throw new common_1.UnauthorizedException('Admin user not found');
            }
            if (adminUser.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Admin account is not active');
            }
            return {
                success: true,
                message: 'Admin verification successful',
                data: {
                    user: {
                        id: adminUser.id,
                        email: adminUser.email,
                        firstName: adminUser.firstName || '',
                        lastName: adminUser.lastName || '',
                        role: adminUser.role,
                        permissions: adminUser.permissions ? JSON.parse(adminUser.permissions) : ['transactions', 'brands', 'categories', 'users', 'coins', 'payments'],
                        status: adminUser.status,
                    }
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        admin_service_1.AdminService])
], AuthService);
