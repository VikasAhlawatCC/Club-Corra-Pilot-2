import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CoinAdminController } from './controllers/coin-admin.controller'
import { TransactionController } from './controllers/transaction.controller'
import { CoinPublicController } from './controllers/coin-public.controller'
import { PendingTransactionController } from './controllers/pending-transaction.controller'
import { CoinsService } from './coins.service'
import { CoinBalance } from './entities/coin-balance.entity'
import { CoinTransaction } from './entities/coin-transaction.entity'
import { PendingTransaction } from './entities/pending-transaction.entity'
import { Brand } from '../brands/entities/brand.entity'
import { User } from '../users/entities/user.entity'
import { TransactionValidationService } from './services/transaction-validation.service'
import { TransactionApprovalService } from './services/transaction-approval.service'
import { BalanceUpdateService } from './services/balance-update.service'
import { PendingTransactionService } from './services/pending-transaction.service'
import { FilesService } from '../files/files.service'
import { File } from '../files/file.entity'
import { BrandsModule } from '../brands/brands.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([CoinBalance, CoinTransaction, PendingTransaction, Brand, User, File]),
    BrandsModule,
  ],
  controllers: [CoinAdminController, TransactionController, CoinPublicController, PendingTransactionController],
  providers: [
    CoinsService,
    TransactionValidationService,
    TransactionApprovalService,
    BalanceUpdateService,
    PendingTransactionService,
    FilesService,
  ],
  exports: [CoinsService, TypeOrmModule],
})
export class CoinsModule {}


