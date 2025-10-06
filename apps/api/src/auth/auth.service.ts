import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { Admin } from '../admin/entities/admin.entity'
import { AdminService } from '../admin/admin.service'

interface AdminLoginDto {
  email: string
  password: string
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
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
}


