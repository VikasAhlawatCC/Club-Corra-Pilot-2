import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { PaymentDetails } from '../users/entities/payment-details.entity';
import { AuthProviderLink } from '../users/entities/auth-provider.entity';
import { CoinBalance } from '../coins/entities/coin-balance.entity';
import { CoinTransaction } from '../coins/entities/coin-transaction.entity';
import { File } from '../files/file.entity';
import { Notification } from '../notifications/notification.entity';
import { AppDataSource } from '../data-source';

async function deleteUserByPhoneNumber(phoneNumber: string): Promise<void> {
  console.log(`🔍 Searching for user with phone number: ${phoneNumber}`);
  
  // Find the user
  const user = await AppDataSource.manager.findOne(User, {
    where: { mobileNumber: phoneNumber },
    relations: ['profile', 'paymentDetails', 'authProviders', 'coinBalance']
  });

  if (!user) {
    console.log(`❌ User with phone number ${phoneNumber} not found`);
    return;
  }

  console.log(`✅ Found user: ${user.id} (${user.mobileNumber})`);
  console.log(`   Status: ${user.status}`);
  console.log(`   Email: ${user.email || 'N/A'}`);
  console.log(`   Created: ${user.createdAt}`);

  // Get counts of related data
  const [
    coinTransactionsCount,
    filesCount,
    notificationsCount
  ] = await Promise.all([
    AppDataSource.manager.count(CoinTransaction, { where: { user: { id: user.id } } }),
    AppDataSource.manager.count(File, { where: { user: { id: user.id } } }),
    AppDataSource.manager.count(Notification, { where: { user: { id: user.id } } })
  ]);

  console.log(`📊 Related data counts:`);
  console.log(`   Coin Transactions: ${coinTransactionsCount}`);
  console.log(`   Files: ${filesCount}`);
  console.log(`   Notifications: ${notificationsCount}`);
  console.log(`   Profile: ${user.profile ? 'Yes' : 'No'}`);
  console.log(`   Payment Details: ${user.paymentDetails ? 'Yes' : 'No'}`);
  console.log(`   Auth Providers: ${user.authProviders?.length || 0}`);
  console.log(`   Coin Balance: ${user.coinBalance ? 'Yes' : 'No'}`);

  // Start transaction for safe deletion
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log(`🗑️  Starting deletion process...`);

    // Delete related data that doesn't cascade
    if (coinTransactionsCount > 0) {
      console.log(`   Deleting ${coinTransactionsCount} coin transactions...`);
      await queryRunner.manager.delete(CoinTransaction, { user: { id: user.id } });
    }

    if (filesCount > 0) {
      console.log(`   Deleting ${filesCount} files...`);
      await queryRunner.manager.delete(File, { user: { id: user.id } });
    }

    if (notificationsCount > 0) {
      console.log(`   Deleting ${notificationsCount} notifications...`);
      await queryRunner.manager.delete(Notification, { user: { id: user.id } });
    }

    // Delete auth providers (cascade should handle this, but being explicit)
    if (user.authProviders && user.authProviders.length > 0) {
      console.log(`   Deleting ${user.authProviders.length} auth providers...`);
      await queryRunner.manager.delete(AuthProviderLink, { user: { id: user.id } });
    }

    // Delete the user (this will cascade to profile, paymentDetails, and coinBalance)
    console.log(`   Deleting user and cascaded data...`);
    await queryRunner.manager.delete(User, { id: user.id });

    await queryRunner.commitTransaction();
    console.log(`✅ User ${phoneNumber} and all related data deleted successfully!`);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error(`❌ Error deleting user:`, error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function main() {
  const phoneNumber = '+918397070108';
  
  try {
    await AppDataSource.initialize();
    console.log('📡 Database connection established');
    
    await deleteUserByPhoneNumber(phoneNumber);
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { deleteUserByPhoneNumber };
