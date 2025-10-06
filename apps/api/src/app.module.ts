import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from 'nestjs-pino'
import { typeOrmConfig } from './config/typeorm.config'
import { CommonModule } from './common/common.module'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { CoinsModule } from './coins/coins.module'
import { BrandsModule } from './brands/brands.module'
import { UsersModule } from './users/users.module'
import { PartnersModule } from './partners/partners.module'
import { WaitlistModule } from './waitlist/waitlist.module'
import { NotificationModule } from './notifications/notification.module'
import { FileModule } from './files/file.module'

@Module({
  imports: [
    // Cast is safe: our config is a valid TypeORM DataSourceOptions
    TypeOrmModule.forRoot(typeOrmConfig as any),
    LoggerModule.forRoot({
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
    CommonModule,
    AuthModule,
    AdminModule,
    CoinsModule,
    BrandsModule,
    UsersModule,
    PartnersModule,
    WaitlistModule,
    NotificationModule,
    FileModule,
  ],
})
export class AppModule {}


