import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { Admin } from '../admin/entities/admin.entity'
import { AdminService } from '../admin/admin.service'
import { User, UserStatus } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { UserLoginDto, UserVerifyOtpDto } from './dto/user-login.dto'

interface AdminLoginDto {
  email: string
  password: string
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
  ) {}

  async adminLogin({ email, password }: AdminLoginDto) {
    try {
      // Check if email is from @clubcorra.com domain
      if (!email.endsWith('@clubcorra.com')) {
        throw new UnauthorizedException('Only @clubcorra.com emails are allowed for admin access');
      }

      // Find admin user by email in the admins table
      const adminUser = await this.adminRepository.findOne({ where: { email } });
      if (!adminUser) {
        throw new UnauthorizedException('Admin user not found');
      }

      // Check if admin is active
      if (adminUser.status !== 'ACTIVE') {
        throw new UnauthorizedException('Admin account is not active');
      }

      // Verify password
      const isPasswordValid = await this.adminService.verifyPassword(adminUser.id, password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
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
    } catch (error) {
      throw error;
    }
  }

  async adminVerify(user: any) {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException('Invalid user token');
      }

      const adminUser = await this.adminService.findById(user.id);
      if (!adminUser) {
        throw new UnauthorizedException('Admin user not found');
      }

      if (adminUser.status !== 'ACTIVE') {
        throw new UnauthorizedException('Admin account is not active');
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
    } catch (error) {
      throw error;
    }
  }

  // User authentication methods
  async userLoginSignup(userLoginDto: UserLoginDto) {
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
    } catch (error) {
      throw error;
    }
  }

  async userVerifyOtp(userVerifyOtpDto: UserVerifyOtpDto) {
    try {
      const { mobileNumber, otp } = userVerifyOtpDto;

      // For development, accept any 6-digit OTP
      // In production, verify against stored OTP
      if (process.env.NODE_ENV !== 'development' && !this.verifyOTP(mobileNumber, otp)) {
        throw new UnauthorizedException('Invalid OTP');
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
      } else {
        // Update existing user
        user.isMobileVerified = true;
        user.status = UserStatus.ACTIVE;
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
    } catch (error) {
      throw error;
    }
  }

  async userVerify(user: any) {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException('Invalid user token');
      }

      const userData = await this.usersService.findById(user.id);
      if (!userData) {
        throw new UnauthorizedException('User not found');
      }

      if (userData.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is not active');
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
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private verifyOTP(mobileNumber: string, otp: string): boolean {
    // In production, implement proper OTP verification logic
    // For now, return true for development
    return true;
  }
}


