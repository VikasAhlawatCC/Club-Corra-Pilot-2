import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin, AdminRole, AdminStatus } from './entities/admin.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async createAdmin(adminData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: AdminRole;
    phoneNumber?: string;
    department?: string;
    permissions?: string;
  }): Promise<Admin> {
    // Check if admin with email already exists
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      throw new BadRequestException('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin
    const admin = this.adminRepository.create({
      email: adminData.email,
      passwordHash: hashedPassword,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      role: adminData.role || 'ADMIN',
      isActive: true,
    });

    return await this.adminRepository.save(admin);
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return await this.adminRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<Admin | null> {
    return await this.adminRepository.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<Admin[]> {
    return await this.adminRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateAdmin(id: string, updateData: Partial<Admin>): Promise<Admin> {
    const admin = await this.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // If password is being updated, hash it
    if (updateData.passwordHash) {
      updateData.passwordHash = await bcrypt.hash(updateData.passwordHash, 10);
    }

    Object.assign(admin, updateData);
    return await this.adminRepository.save(admin);
  }

  async deleteAdmin(id: string): Promise<void> {
    const admin = await this.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.adminRepository.remove(admin);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.adminRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async updateRefreshToken(id: string, refreshTokenHash: string): Promise<void> {
    await this.adminRepository.update(id, {
      refreshTokenHash,
    });
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const admin = await this.findById(id);
    if (!admin || !admin.passwordHash) {
      return false;
    }
    return bcrypt.compare(password, admin.passwordHash);
  }

  async validatePassword(admin: Admin, password: string): Promise<boolean> {
    if (!admin.passwordHash) {
      return false;
    }
    return bcrypt.compare(password, admin.passwordHash);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const admin = await this.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Verify current password
    const isValidPassword = await this.validatePassword(admin, currentPassword);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await this.adminRepository.update(id, {
      passwordHash: hashedNewPassword,
    });
  }
}
