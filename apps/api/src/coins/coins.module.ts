import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CoinAdminController } from './controllers/coin-admin.controller'
import { CoinsService } from './coins.service'
import { CoinBalance } from './entities/coin-balance.entity'
import { CoinTransaction } from './entities/coin-transaction.entity'
import { Brand } from '../brands/entities/brand.entity'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CoinBalance, CoinTransaction, Brand, User])],
  controllers: [CoinAdminController],
  providers: [CoinsService],
  exports: [CoinsService, TypeOrmModule],
})
export class CoinsModule {}


