import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { Admin } from '../admin/entities/admin.entity'
import { AdminService } from '../admin/admin.service'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { UserProfile } from '../users/entities/user-profile.entity'
import { PaymentDetails } from '../users/entities/payment-details.entity'
import { AuthProviderLink } from '../users/entities/auth-provider.entity'
import { CoinBalance } from '../coins/entities/coin-balance.entity'
import { CoinTransaction } from '../coins/entities/coin-transaction.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      User,
      UserProfile,
      PaymentDetails,
      AuthProviderLink,
      CoinBalance,
      CoinTransaction,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'dev-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AdminService, UsersService],
  exports: [AuthService],
})
export class AuthModule {}


