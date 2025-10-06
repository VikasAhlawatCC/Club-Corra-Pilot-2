"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const nestjs_pino_1 = require("nestjs-pino");
const typeorm_config_1 = require("./config/typeorm.config");
const common_module_1 = require("./common/common.module");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const coins_module_1 = require("./coins/coins.module");
const brands_module_1 = require("./brands/brands.module");
const users_module_1 = require("./users/users.module");
const partners_module_1 = require("./partners/partners.module");
const waitlist_module_1 = require("./waitlist/waitlist.module");
const notification_module_1 = require("./notifications/notification.module");
const file_module_1 = require("./files/file.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Cast is safe: our config is a valid TypeORM DataSourceOptions
            typeorm_1.TypeOrmModule.forRoot(typeorm_config_1.typeOrmConfig),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
                    autoLogging: true,
                    redact: {
                        paths: ['req.headers.authorization', 'req.headers.cookie'],
                        remove: true,
                    },
                    transport: process.env.NODE_ENV === 'production' ? undefined : {
                        target: 'pino-pretty',
                        options: { colorize: true, translateTime: 'SYS:standard' },
                    },
                },
            }),
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            coins_module_1.CoinsModule,
            brands_module_1.BrandsModule,
            users_module_1.UsersModule,
            partners_module_1.PartnersModule,
            waitlist_module_1.WaitlistModule,
            notification_module_1.NotificationModule,
            file_module_1.FileModule,
        ],
    })
], AppModule);
