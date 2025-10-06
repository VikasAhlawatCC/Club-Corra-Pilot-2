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
const coins_service_1 = require("./coins.service");
const coin_balance_entity_1 = require("./entities/coin-balance.entity");
const coin_transaction_entity_1 = require("./entities/coin-transaction.entity");
const brand_entity_1 = require("../brands/entities/brand.entity");
const user_entity_1 = require("../users/entities/user.entity");
let CoinsModule = class CoinsModule {
};
exports.CoinsModule = CoinsModule;
exports.CoinsModule = CoinsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([coin_balance_entity_1.CoinBalance, coin_transaction_entity_1.CoinTransaction, brand_entity_1.Brand, user_entity_1.User])],
        controllers: [coin_admin_controller_1.CoinAdminController],
        providers: [coins_service_1.CoinsService],
        exports: [coins_service_1.CoinsService, typeorm_1.TypeOrmModule],
    })
], CoinsModule);
