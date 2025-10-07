"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserByPhoneNumber = deleteUserByPhoneNumber;
const user_entity_1 = require("../users/entities/user.entity");
const auth_provider_entity_1 = require("../users/entities/auth-provider.entity");
const coin_transaction_entity_1 = require("../coins/entities/coin-transaction.entity");
const file_entity_1 = require("../files/file.entity");
const notification_entity_1 = require("../notifications/notification.entity");
const data_source_1 = require("../data-source");
async function deleteUserByPhoneNumber(phoneNumber) {
    console.log(`🔍 Searching for user with phone number: ${phoneNumber}`);
    // Find the user
    const user = await data_source_1.AppDataSource.manager.findOne(user_entity_1.User, {
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
    const [coinTransactionsCount, filesCount, notificationsCount] = await Promise.all([
        data_source_1.AppDataSource.manager.count(coin_transaction_entity_1.CoinTransaction, { where: { user: { id: user.id } } }),
        data_source_1.AppDataSource.manager.count(file_entity_1.File, { where: { user: { id: user.id } } }),
        data_source_1.AppDataSource.manager.count(notification_entity_1.Notification, { where: { user: { id: user.id } } })
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
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        console.log(`🗑️  Starting deletion process...`);
        // Delete related data that doesn't cascade
        if (coinTransactionsCount > 0) {
            console.log(`   Deleting ${coinTransactionsCount} coin transactions...`);
            await queryRunner.manager.delete(coin_transaction_entity_1.CoinTransaction, { user: { id: user.id } });
        }
        if (filesCount > 0) {
            console.log(`   Deleting ${filesCount} files...`);
            await queryRunner.manager.delete(file_entity_1.File, { user: { id: user.id } });
        }
        if (notificationsCount > 0) {
            console.log(`   Deleting ${notificationsCount} notifications...`);
            await queryRunner.manager.delete(notification_entity_1.Notification, { user: { id: user.id } });
        }
        // Delete auth providers (cascade should handle this, but being explicit)
        if (user.authProviders && user.authProviders.length > 0) {
            console.log(`   Deleting ${user.authProviders.length} auth providers...`);
            await queryRunner.manager.delete(auth_provider_entity_1.AuthProviderLink, { user: { id: user.id } });
        }
        // Delete the user (this will cascade to profile, paymentDetails, and coinBalance)
        console.log(`   Deleting user and cascaded data...`);
        await queryRunner.manager.delete(user_entity_1.User, { id: user.id });
        await queryRunner.commitTransaction();
        console.log(`✅ User ${phoneNumber} and all related data deleted successfully!`);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error(`❌ Error deleting user:`, error);
        throw error;
    }
    finally {
        await queryRunner.release();
    }
}
async function main() {
    const phoneNumber = '+918397070108';
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('📡 Database connection established');
        await deleteUserByPhoneNumber(phoneNumber);
    }
    catch (error) {
        console.error('💥 Script failed:', error);
        process.exit(1);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
        console.log('🔌 Database connection closed');
    }
}
// Run the script
if (require.main === module) {
    main();
}
