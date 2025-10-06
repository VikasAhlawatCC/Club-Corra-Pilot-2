import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'
import { UserProfile } from './entities/user-profile.entity'
import { PaymentDetails } from './entities/payment-details.entity'
import { AuthProviderLink } from './entities/auth-provider.entity'
import { CoinBalance } from '../coins/entities/coin-balance.entity'
import { CoinTransaction } from '../coins/entities/coin-transaction.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, PaymentDetails, AuthProviderLink, CoinBalance, CoinTransaction])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}


