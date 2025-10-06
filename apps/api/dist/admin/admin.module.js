"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
const admin_controller_1 = require("./admin.controller");
const form_submissions_controller_1 = require("./form-submissions.controller");
const admin_users_controller_1 = require("./controllers/admin-users.controller");
const admin_service_1 = require("./admin.service");
const user_entity_1 = require("../users/entities/user.entity");
const coin_transaction_entity_1 = require("../coins/entities/coin-transaction.entity");
const brand_entity_1 = require("../brands/entities/brand.entity");
const coin_balance_entity_1 = require("../coins/entities/coin-balance.entity");
const admin_entity_1 = require("./entities/admin.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const dashboard_metrics_cache_entity_1 = require("./entities/dashboard-metrics-cache.entity");
const experiment_config_entity_1 = require("./entities/experiment-config.entity");
const risk_signal_entity_1 = require("./entities/risk-signal.entity");
const saved_view_entity_1 = require("./entities/saved-view.entity");
const financial_reconciliation_entity_1 = require("./entities/financial-reconciliation.entity");
const partner_application_entity_1 = require("../partners/entities/partner-application.entity");
const waitlist_entry_entity_1 = require("../waitlist/entities/waitlist-entry.entity");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                coin_transaction_entity_1.CoinTransaction,
                brand_entity_1.Brand,
                coin_balance_entity_1.CoinBalance,
                admin_entity_1.Admin,
                audit_log_entity_1.AuditLog,
                dashboard_metrics_cache_entity_1.DashboardMetricsCache,
                experiment_config_entity_1.ExperimentConfig,
                risk_signal_entity_1.RiskSignal,
                saved_view_entity_1.SavedView,
                financial_reconciliation_entity_1.FinancialReconciliation,
                partner_application_entity_1.PartnerApplication,
                waitlist_entry_entity_1.WaitlistEntry
            ])
        ],
        controllers: [dashboard_controller_1.DashboardController, admin_controller_1.AdminController, form_submissions_controller_1.FormSubmissionsController, admin_users_controller_1.AdminUsersController],
        providers: [dashboard_service_1.DashboardService, admin_service_1.AdminService],
        exports: [dashboard_service_1.DashboardService, admin_service_1.AdminService, typeorm_1.TypeOrmModule],
    })
], AdminModule);
