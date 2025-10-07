"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const typeorm_config_1 = require("../config/typeorm.config");
const pending_transaction_entity_1 = require("../coins/entities/pending-transaction.entity");
const typeorm_2 = require("typeorm");
/**
 * Script to clean up expired and old pending transactions
 * Run this periodically via cron job (e.g., daily)
 *
 * Usage:
 * npx ts-node src/scripts/cleanup-pending-transactions.ts
 */
async function cleanupPendingTransactions() {
    console.log('Starting pending transactions cleanup...');
    const dataSource = new typeorm_1.DataSource(typeorm_config_1.typeOrmConfig);
    try {
        await dataSource.initialize();
        console.log('Database connection established');
        const pendingTransactionRepo = dataSource.getRepository(pending_transaction_entity_1.PendingTransaction);
        // 1. Delete expired pending transactions (older than 24 hours)
        const expiredResult = await pendingTransactionRepo.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date())
        });
        console.log(`Deleted ${expiredResult.affected || 0} expired pending transactions`);
        // 2. Delete claimed pending transactions older than 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const claimedResult = await pendingTransactionRepo.delete({
            claimed: true,
            claimedAt: (0, typeorm_2.LessThan)(sevenDaysAgo)
        });
        console.log(`Deleted ${claimedResult.affected || 0} old claimed pending transactions`);
        console.log('Cleanup completed successfully');
    }
    catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
    finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('Database connection closed');
        }
    }
}
// Run the cleanup
cleanupPendingTransactions()
    .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
});
