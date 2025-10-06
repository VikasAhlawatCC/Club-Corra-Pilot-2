import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
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
  async list(@Query() searchDto: UserSearchDto): Promise<UserListResponseDto> {
    return this.usersService.findAll(searchDto.page, searchDto.limit, searchDto);
  }

  @Get('stats')
  async stats() {
    return this.usersService.getUserStats();
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
  async get(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
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
    return this.usersService.getUserBalance(id);
  }

  @Patch(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() body: UpdateUserProfileDto) {
    return this.usersService.updateProfile(id, body);
  }

  @Patch(':id/email')
  async updateEmail(@Param('id') id: string, @Body() body: UpdateUserEmailDto) {
    return this.usersService.updateEmail(id, body.email);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateUserStatusDto) {
    return this.usersService.updateUserStatus(id, body.status);
  }

  @Patch(':id/payment-details')
  async updatePaymentDetails(@Param('id') id: string, @Body() body: UpdatePaymentDetailsDto) {
    return this.usersService.updatePaymentDetails(id, body);
  }
}


