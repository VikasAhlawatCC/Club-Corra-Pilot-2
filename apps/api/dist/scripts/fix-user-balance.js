"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const users_service_1 = require("../users/users.service");
const coin_balance_entity_1 = require("../coins/entities/coin-balance.entity");
const typeorm_1 = require("@nestjs/typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
    const coinBalanceRepository = app.get((0, typeorm_1.getRepositoryToken)(coin_balance_entity_1.CoinBalance));
    const mobileNumber = '+918397070108';
    try {
        console.log(`Finding user with mobile number: ${mobileNumber}`);
        const user = await usersService.findByMobileNumber(mobileNumber);
        if (!user) {
            console.log('User not found.');
            return;
        }
        console.log(`Found user: ${user.id}`);
        const coinBalance = await coinBalanceRepository.findOne({ where: { user: { id: user.id } } });
        if (coinBalance) {
            console.log(`Current balance: ${coinBalance.balance}, earned: ${coinBalance.totalEarned}, redeemed: ${coinBalance.totalRedeemed}`);
            console.log('Resetting balance to 0...');
            coinBalance.balance = '0';
            coinBalance.totalEarned = '0';
            coinBalance.totalRedeemed = '0';
            await coinBalanceRepository.save(coinBalance);
            console.log('Balance reset successfully.');
        }
        else {
            console.log('CoinBalance record not found for this user.');
        }
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
