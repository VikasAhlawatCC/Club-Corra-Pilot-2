import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { AdminController } from './admin.controller'
import { FormSubmissionsController } from './form-submissions.controller'
import { AdminUsersController } from './controllers/admin-users.controller'
import { AdminService } from './admin.service'
import { User } from '../users/entities/user.entity'
import { CoinTransaction } from '../coins/entities/coin-transaction.entity'
import { Brand } from '../brands/entities/brand.entity'
import { CoinBalance } from '../coins/entities/coin-balance.entity'
import { Admin } from './entities/admin.entity'
import { AuditLog } from './entities/audit-log.entity'
import { DashboardMetricsCache } from './entities/dashboard-metrics-cache.entity'
import { ExperimentConfig } from './entities/experiment-config.entity'
import { RiskSignal } from './entities/risk-signal.entity'
import { SavedView } from './entities/saved-view.entity'
import { FinancialReconciliation } from './entities/financial-reconciliation.entity'
import { PartnerApplication } from '../partners/entities/partner-application.entity'
import { WaitlistEntry } from '../waitlist/entities/waitlist-entry.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      CoinTransaction, 
      Brand,
      CoinBalance,
      Admin, 
      AuditLog, 
      DashboardMetricsCache, 
      ExperimentConfig, 
      RiskSignal, 
      SavedView,
      FinancialReconciliation,
      PartnerApplication,
      WaitlistEntry
    ])
  ],
  controllers: [DashboardController, AdminController, FormSubmissionsController, AdminUsersController],
  providers: [DashboardService, AdminService],
  exports: [DashboardService, AdminService, TypeOrmModule],
})
export class AdminModule {}


