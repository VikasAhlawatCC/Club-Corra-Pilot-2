import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, BadRequestException } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { AdminService } from '../admin.service'
import { AdminRole } from '../entities/admin.entity'

class CreateAdminDto {
  email!: string
  password!: string
  firstName!: string
  lastName!: string
  role?: AdminRole
  phoneNumber?: string
  department?: string
  permissions?: string
}

class UpdateAdminDto {
  firstName?: string
  lastName?: string
  role?: AdminRole
  phoneNumber?: string
  department?: string
  permissions?: string
  isActive?: boolean
}

class UpdatePasswordDto {
  currentPassword!: string
  newPassword!: string
}

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/admins')
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async getAllAdmins() {
    return this.adminService.findAll();
  }

  @Get(':id')
  async getAdminById(@Param('id') id: string) {
    return this.adminService.findById(id);
  }

  @Post()
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Put(':id')
  async updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Put(':id/password')
  async updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
    // This would need additional validation logic
    throw new BadRequestException('Password update not implemented yet');
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: string) {
    await this.adminService.deleteAdmin(id);
    return { message: 'Admin deleted successfully' };
  }

  @Get('stats')
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
}
