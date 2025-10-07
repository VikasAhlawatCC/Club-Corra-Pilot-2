"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const coin_admin_controller_1 = require("./controllers/coin-admin.controller");
const transaction_controller_1 = require("./controllers/transaction.controller");
const coin_public_controller_1 = require("./controllers/coin-public.controller");
const pending_transaction_controller_1 = require("./controllers/pending-transaction.controller");
const coins_service_1 = require("./coins.service");
const coin_balance_entity_1 = require("./entities/coin-balance.entity");
const coin_transaction_entity_1 = require("./entities/coin-transaction.entity");
const pending_transaction_entity_1 = require("./entities/pending-transaction.entity");
const brand_entity_1 = require("../brands/entities/brand.entity");
const user_entity_1 = require("../users/entities/user.entity");
const transaction_validation_service_1 = require("./services/transaction-validation.service");
const transaction_approval_service_1 = require("./services/transaction-approval.service");
const balance_update_service_1 = require("./services/balance-update.service");
const pending_transaction_service_1 = require("./services/pending-transaction.service");
const files_service_1 = require("../files/files.service");
const file_entity_1 = require("../files/file.entity");
const brands_module_1 = require("../brands/brands.module");
let CoinsModule = class CoinsModule {
};
exports.CoinsModule = CoinsModule;
exports.CoinsModule = CoinsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([coin_balance_entity_1.CoinBalance, coin_transaction_entity_1.CoinTransaction, pending_transaction_entity_1.PendingTransaction, brand_entity_1.Brand, user_entity_1.User, file_entity_1.File]),
            brands_module_1.BrandsModule,
        ],
        controllers: [coin_admin_controller_1.CoinAdminController, transaction_controller_1.TransactionController, coin_public_controller_1.CoinPublicController, pending_transaction_controller_1.PendingTransactionController],
        providers: [
            coins_service_1.CoinsService,
            transaction_validation_service_1.TransactionValidationService,
            transaction_approval_service_1.TransactionApprovalService,
            balance_update_service_1.BalanceUpdateService,
            pending_transaction_service_1.PendingTransactionService,
            files_service_1.FilesService,
        ],
        exports: [coins_service_1.CoinsService, typeorm_1.TypeOrmModule],
    })
], CoinsModule);
