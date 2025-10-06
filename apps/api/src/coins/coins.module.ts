import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CoinAdminController } from './controllers/coin-admin.controller'
import { TransactionController } from './controllers/transaction.controller'
import { CoinsService } from './coins.service'
import { CoinBalance } from './entities/coin-balance.entity'
import { CoinTransaction } from './entities/coin-transaction.entity'
import { Brand } from '../brands/entities/brand.entity'
import { User } from '../users/entities/user.entity'
import { TransactionValidationService } from './services/transaction-validation.service'
import { TransactionApprovalService } from './services/transaction-approval.service'
import { BalanceUpdateService } from './services/balance-update.service'

@Module({
  imports: [TypeOrmModule.forFeature([CoinBalance, CoinTransaction, Brand, User])],
  controllers: [CoinAdminController, TransactionController],
  providers: [
    CoinsService,
    TransactionValidationService,
    TransactionApprovalService,
    BalanceUpdateService,
  ],
  exports: [CoinsService, TypeOrmModule],
})
export class CoinsModule {}


