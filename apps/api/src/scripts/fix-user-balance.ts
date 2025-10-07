
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { CoinBalance } from '../coins/entities/coin-balance.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const coinBalanceRepository = app.get(getRepositoryToken(CoinBalance));

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
    } else {
      console.log('CoinBalance record not found for this user.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
