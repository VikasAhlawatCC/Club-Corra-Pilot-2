import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, Between } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { PaymentDetails } from './entities/payment-details.entity';
import { AuthProviderLink } from './entities/auth-provider.entity';
import { CoinBalance } from '../coins/entities/coin-balance.entity';
import { CoinTransaction } from '../coins/entities/coin-transaction.entity';
import { UserSearchDto } from './dto/user-search.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { UpdateUserProfileDto, UpdatePaymentDetailsDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(PaymentDetails)
    private paymentDetailsRepository: Repository<PaymentDetails>,
    @InjectRepository(AuthProviderLink)
    private authProviderRepository: Repository<AuthProviderLink>,
    @InjectRepository(CoinBalance)
    private coinBalanceRepository: Repository<CoinBalance>,
    @InjectRepository(CoinTransaction)
    private coinTransactionRepository: Repository<CoinTransaction>,
  ) {}

  async findAll(page: number = 1, limit: number = 20, filters: UserSearchDto = {}): Promise<UserListResponseDto> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.paymentDetails', 'paymentDetails')
      .leftJoinAndSelect('user.authProviders', 'authProviders')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }
    if (filters.search) {
      queryBuilder.andWhere(
        '(user.mobileNumber ILIKE :search OR user.email ILIKE :search OR profile.firstName ILIKE :search OR profile.lastName ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    if (filters.isMobileVerified !== undefined) {
      queryBuilder.andWhere('user.isMobileVerified = :isMobileVerified', { isMobileVerified: filters.isMobileVerified });
    }
    if (filters.isEmailVerified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :isEmailVerified', { isEmailVerified: filters.isEmailVerified });
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'paymentDetails', 'authProviders'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByMobileNumber(mobileNumber: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { mobileNumber },
      relations: ['profile', 'paymentDetails', 'authProviders'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'paymentDetails', 'authProviders'],
    });
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findById(id);
    user.status = status;
    return this.userRepository.save(user);
  }

  async updateProfile(id: string, profileData: UpdateUserProfileDto): Promise<UserProfile> {
    const user = await this.findById(id);
    
    if (!user.profile) {
      // Create profile if it doesn't exist
      const profile = this.userProfileRepository.create({
        ...profileData,
        user: { id },
      });
      return this.userProfileRepository.save(profile);
    }

    Object.assign(user.profile, profileData);
    return this.userProfileRepository.save(user.profile);
  }

  async updateEmail(id: string, email: string): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.findById(id);
    user.email = email;
    user.isEmailVerified = false; // Reset verification status
    return this.userRepository.save(user);
  }

  async updatePaymentDetails(id: string, paymentData: UpdatePaymentDetailsDto): Promise<PaymentDetails> {
    const user = await this.findById(id);
    
    if (!user.paymentDetails) {
      // Create payment details if they don't exist
      const paymentDetails = this.paymentDetailsRepository.create({
        ...paymentData,
        user: { id },
      });
      return this.paymentDetailsRepository.save(paymentDetails);
    }

    Object.assign(user.paymentDetails, paymentData);
    return this.paymentDetailsRepository.save(user.paymentDetails);
  }

  async getUserStats(): Promise<any> {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      mobileVerifiedUsers,
      emailVerifiedUsers,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.PENDING } }),
      this.userRepository.count({ where: { status: UserStatus.SUSPENDED } }),
      this.userRepository.count({ where: { isMobileVerified: true } }),
      this.userRepository.count({ where: { isEmailVerified: true } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      mobileVerifiedUsers,
      emailVerifiedUsers,
    };
  }

  async getUserTransactionHistory(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.coinTransactionRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['brand'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserBalance(userId: string): Promise<CoinBalance | null> {
    return this.coinBalanceRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  async getUserActivity(userId: string): Promise<any> {
    const user = await this.findById(userId);
    const balance = await this.getUserBalance(userId);
    const recentTransactions = await this.coinTransactionRepository.find({
      where: { user: { id: userId } },
      relations: ['brand'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      user,
      balance,
      recentTransactions,
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<UserListResponseDto> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where(
        '(user.mobileNumber ILIKE :query OR user.email ILIKE :query OR profile.firstName ILIKE :query OR profile.lastName ILIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUsersByStatus(status: UserStatus, page: number = 1, limit: number = 20): Promise<UserListResponseDto> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      where: { status },
      relations: ['profile', 'paymentDetails'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getNewUsers(days: number = 30, page: number = 1, limit: number = 20): Promise<UserListResponseDto> {
    const skip = (page - 1) * limit;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [users, total] = await this.userRepository.findAndCount({
      where: {
        createdAt: MoreThanOrEqual(startDate),
      },
      relations: ['profile'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserGrowthStats(days: number = 30): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers,
      newUsers,
      activeUsers,
      growthRate,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({
        where: {
          createdAt: MoreThanOrEqual(startDate),
        },
      }),
      this.userRepository.count({
        where: { status: UserStatus.ACTIVE },
      }),
      this.calculateGrowthRate(startDate, endDate),
    ]);

    return {
      totalUsers,
      newUsers,
      activeUsers,
      growthRate,
      period: `${days} days`,
    };
  }

  private async calculateGrowthRate(startDate: Date, endDate: Date): Promise<number> {
    const midPoint = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
    
    const [firstHalf, secondHalf] = await Promise.all([
      this.userRepository.count({
        where: {
          createdAt: Between(startDate, midPoint),
        },
      }),
      this.userRepository.count({
        where: {
          createdAt: Between(midPoint, endDate),
        },
      }),
    ]);

    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0;
    return ((secondHalf - firstHalf) / firstHalf) * 100;
  }

  async exportUsers(filters: any = {}): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.paymentDetails', 'paymentDetails')
      .orderBy('user.createdAt', 'DESC');

    if (filters.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }
    if (filters.startDate) {
      queryBuilder.andWhere('user.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return queryBuilder.getMany();
  }
}
