import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'
import { UsersService } from './users.service'
import { User, UserStatus } from './entities/user.entity'
import { UserSearchDto } from './dto/user-search.dto'
import { UserListResponseDto } from './dto/user-list-response.dto'
import { UpdateUserProfileDto, UpdateUserEmailDto, UpdateUserStatusDto, UpdatePaymentDetailsDto } from './dto/update-user.dto'

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@Query() searchDto: UserSearchDto) {
    const result = await this.usersService.findAll(searchDto.page, searchDto.limit, searchDto);
    return {
      success: true,
      message: 'Users fetched successfully',
      data: result
    };
  }

  @Get('stats')
  async stats() {
    const result = await this.usersService.getUserStats();
    return {
      success: true,
      message: 'User stats fetched successfully',
      data: result
    };
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.usersService.searchUsers(query, page, limit);
  }

  @Get('new')
  async getNewUsers(
    @Query('days') days: number = 30,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.usersService.getNewUsers(days, page, limit);
  }

  @Get('growth')
  async getGrowthStats(@Query('days') days: number = 30) {
    return this.usersService.getUserGrowthStats(days);
  }

  @Get('export')
  async exportUsers(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = { status, startDate, endDate };
    return this.usersService.exportUsers(filters);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.usersService.findById(id);
    return {
      success: true,
      message: 'User fetched successfully',
      data: result
    };
  }

  @Get(':id/activity')
  async getActivity(@Param('id') id: string) {
    return this.usersService.getUserActivity(id);
  }

  @Get(':id/transactions')
  async getTransactions(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.usersService.getUserTransactionHistory(id, page, limit);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    const result = await this.usersService.getUserBalance(id);
    return {
      success: true,
      message: 'User balance fetched successfully',
      data: { balance: result }
    };
  }

  @Patch(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() body: UpdateUserProfileDto) {
    const result = await this.usersService.updateProfile(id, body);
    return {
      success: true,
      message: 'User profile updated successfully',
      data: result
    };
  }

  @Patch(':id/email')
  async updateEmail(@Param('id') id: string, @Body() body: UpdateUserEmailDto) {
    const result = await this.usersService.updateEmail(id, body.email);
    return {
      success: true,
      message: 'User email updated successfully',
      data: result
    };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateUserStatusDto) {
    const result = await this.usersService.updateUserStatus(id, body.status);
    return {
      success: true,
      message: 'User status updated successfully',
      data: result
    };
  }

  @Patch(':id/payment-details')
  async updatePaymentDetails(@Param('id') id: string, @Body() body: UpdatePaymentDetailsDto) {
    return this.usersService.updatePaymentDetails(id, body);
  }

  @Post()
  async createUser(@Body() body: { firstName: string; lastName: string; mobileNumber: string; email?: string }) {
    const result = await this.usersService.createUser(body);
    return {
      success: true,
      message: 'User created successfully',
      data: result
    };
  }

  @Patch(':id/coins')
  async adjustUserCoins(@Param('id') id: string, @Body() body: { newBalance?: number; delta?: number; reason?: string }) {
    const result = await this.usersService.adjustUserCoins(id, body);
    return {
      success: true,
      message: 'User coins adjusted successfully',
      data: result
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.usersService.deleteUser(id);
    return {
      success: true,
      message: 'User deleted successfully',
      data: result
    };
  }
}


