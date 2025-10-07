"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./jwt.strategy");
const admin_entity_1 = require("../admin/entities/admin.entity");
const admin_service_1 = require("../admin/admin.service");
const user_entity_1 = require("../users/entities/user.entity");
const users_service_1 = require("../users/users.service");
const user_profile_entity_1 = require("../users/entities/user-profile.entity");
const payment_details_entity_1 = require("../users/entities/payment-details.entity");
const auth_provider_entity_1 = require("../users/entities/auth-provider.entity");
const coin_balance_entity_1 = require("../coins/entities/coin-balance.entity");
const coin_transaction_entity_1 = require("../coins/entities/coin-transaction.entity");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                admin_entity_1.Admin,
                user_entity_1.User,
                user_profile_entity_1.UserProfile,
                payment_details_entity_1.PaymentDetails,
                auth_provider_entity_1.AuthProviderLink,
                coin_balance_entity_1.CoinBalance,
                coin_transaction_entity_1.CoinTransaction,
            ]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                useFactory: () => ({
                    secret: process.env.JWT_SECRET || 'dev-secret',
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, admin_service_1.AdminService, users_service_1.UsersService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
