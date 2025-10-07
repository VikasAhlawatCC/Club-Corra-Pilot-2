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
const user_entity_1 = require("../users/entities/user.entity");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(adminRepository, userRepository, jwtService, adminService, usersService) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.adminService = adminService;
        this.usersService = usersService;
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
    // User authentication methods
    async userLoginSignup(userLoginDto) {
        try {
            const { mobileNumber } = userLoginDto;
            // Generate OTP (for development, use a simple 6-digit number)
            // In production, integrate with SMS service like Twilio
            const otp = this.generateOTP();
            // For development, we'll store OTP in memory or use a simple approach
            // In production, use Redis or database to store OTP with expiration
            console.log(`OTP for ${mobileNumber}: ${otp}`);
            // Check if user exists
            const existingUser = await this.usersService.findByMobileNumber(mobileNumber);
            if (existingUser) {
                // Update last login attempt
                existingUser.lastLoginAt = new Date();
                await this.userRepository.save(existingUser);
            }
            return {
                success: true,
                message: 'OTP sent successfully',
                data: {
                    mobileNumber,
                    otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only return OTP in development
                    isNewUser: !existingUser,
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    async userVerifyOtp(userVerifyOtpDto) {
        try {
            const { mobileNumber, otp } = userVerifyOtpDto;
            // For development, accept any 6-digit OTP
            // In production, verify against stored OTP
            if (process.env.NODE_ENV !== 'development' && !this.verifyOTP(mobileNumber, otp)) {
                throw new common_1.UnauthorizedException('Invalid OTP');
            }
            // Find or create user
            let user = await this.usersService.findByMobileNumber(mobileNumber);
            if (!user) {
                // Create new user with minimal data (only mobile number as per requirements)
                user = await this.usersService.createUser({
                    firstName: '',
                    lastName: '',
                    mobileNumber,
                });
            }
            else {
                // Update existing user
                user.isMobileVerified = true;
                user.status = user_entity_1.UserStatus.ACTIVE;
                user.lastLoginAt = new Date();
                await this.userRepository.save(user);
            }
            // Generate JWT token for user
            const payload = {
                sub: user.id,
                mobileNumber: user.mobileNumber,
                role: 'user',
                type: 'user'
            };
            const accessToken = await this.jwtService.signAsync(payload);
            return {
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        mobileNumber: user.mobileNumber,
                        isMobileVerified: user.isMobileVerified,
                        status: user.status,
                        createdAt: user.createdAt,
                    },
                    accessToken,
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    async userVerify(user) {
        try {
            if (!user || !user.id) {
                throw new common_1.UnauthorizedException('Invalid user token');
            }
            const userData = await this.usersService.findById(user.id);
            if (!userData) {
                throw new common_1.UnauthorizedException('User not found');
            }
            if (userData.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('User account is not active');
            }
            return {
                success: true,
                message: 'User verification successful',
                data: {
                    user: {
                        id: userData.id,
                        mobileNumber: userData.mobileNumber,
                        isMobileVerified: userData.isMobileVerified,
                        status: userData.status,
                        createdAt: userData.createdAt,
                        totalCoins: String(userData.coinBalance?.balance || 0),
                        totalEarned: String(userData.coinBalance?.totalEarned || 0),
                        totalRedeemed: String(userData.coinBalance?.totalRedeemed || 0),
                    }
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    verifyOTP(mobileNumber, otp) {
        // In production, implement proper OTP verification logic
        // For now, return true for development
        return true;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        admin_service_1.AdminService,
        users_service_1.UsersService])
], AuthService);
