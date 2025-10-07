"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMigrationService = void 0;
exports.runDataMigration = runDataMigration;
const typeorm_1 = require("typeorm");
const coin_balance_entity_1 = require("../coins/entities/coin-balance.entity");
const coin_transaction_entity_1 = require("../coins/entities/coin-transaction.entity");
/**
 * Data migration script to fix existing data inconsistencies
 * This script should be run after the database schema migrations
 */
class DataMigrationService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async migrateExistingData() {
        console.log('Starting data migration...');
        try {
            await this.fixBillAmountDataTypes();
            await this.recalculateCoinBalances();
            await this.validateDataIntegrity();
            console.log('Data migration completed successfully!');
        }
        catch (error) {
            console.error('Data migration failed:', error);
            throw error;
        }
    }
    /**
     * Fix any decimal values in bill_amount to integers
     */
    async fixBillAmountDataTypes() {
        console.log('Fixing bill_amount data types...');
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            // Update any decimal values to integers (round to nearest whole number)
            const result = await queryRunner.query(`
        UPDATE coin_transactions 
        SET bill_amount = ROUND(bill_amount::DECIMAL)::INTEGER 
        WHERE bill_amount IS NOT NULL 
        AND bill_amount::TEXT LIKE '%.%'
      `);
            console.log(`Fixed ${result.rowCount || 0} decimal bill_amount values`);
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Recalculate coin balances based on transaction history
     * This ensures data consistency after the schema changes
     */
    async recalculateCoinBalances() {
        console.log('Recalculating coin balances...');
        const transactionRepository = this.dataSource.getRepository(coin_transaction_entity_1.CoinTransaction);
        const balanceRepository = this.dataSource.getRepository(coin_balance_entity_1.CoinBalance);
        // Get all users with transactions
        const usersWithTransactions = await transactionRepository
            .createQueryBuilder('transaction')
            .select('DISTINCT transaction.userId', 'userId')
            .where('transaction.userId IS NOT NULL')
            .getRawMany();
        for (const { userId } of usersWithTransactions) {
            await this.recalculateUserBalance(userId, transactionRepository, balanceRepository);
        }
        console.log(`Recalculated balances for ${usersWithTransactions.length} users`);
    }
    /**
     * Recalculate balance for a specific user
     */
    async recalculateUserBalance(userId, transactionRepository, balanceRepository) {
        // Get all approved/pending transactions for this user
        const transactions = await transactionRepository.find({
            where: {
                user: { id: userId },
                status: ['PENDING', 'APPROVED', 'PAID', 'UNPAID']
            },
            order: { createdAt: 'ASC' }
        });
        let totalEarned = 0;
        let totalRedeemed = 0;
        let balance = 0;
        // Calculate totals from transaction history
        for (const tx of transactions) {
            if (tx.coinsEarned) {
                totalEarned += tx.coinsEarned;
                balance += tx.coinsEarned;
            }
            if (tx.coinsRedeemed) {
                totalRedeemed += tx.coinsRedeemed;
                balance -= tx.coinsRedeemed;
            }
        }
        // Update or create balance record
        let userBalance = await balanceRepository.findOne({
            where: { user: { id: userId } }
        });
        if (!userBalance) {
            userBalance = balanceRepository.create({
                user: { id: userId },
                balance: 0,
                totalEarned: 0,
                totalRedeemed: 0
            });
        }
        userBalance.balance = balance;
        userBalance.totalEarned = totalEarned;
        userBalance.totalRedeemed = totalRedeemed;
        await balanceRepository.save(userBalance);
    }
    /**
     * Validate data integrity after migration
     */
    async validateDataIntegrity() {
        console.log('Validating data integrity...');
        const balanceRepository = this.dataSource.getRepository(coin_balance_entity_1.CoinBalance);
        const transactionRepository = this.dataSource.getRepository(coin_transaction_entity_1.CoinTransaction);
        // Check for balance inconsistencies
        const inconsistentBalances = await balanceRepository
            .createQueryBuilder('balance')
            .where('balance.balance != (balance.totalEarned - balance.totalRedeemed)')
            .getMany();
        if (inconsistentBalances.length > 0) {
            console.warn(`Found ${inconsistentBalances.length} inconsistent balances:`);
            for (const balance of inconsistentBalances) {
                console.warn(`User ${balance.user}: balance=${balance.balance}, totalEarned=${balance.totalEarned}, totalRedeemed=${balance.totalRedeemed}`);
            }
        }
        else {
            console.log('All balances are consistent!');
        }
        // Check for negative balances
        const negativeBalances = await balanceRepository
            .createQueryBuilder('balance')
            .where('balance.balance < 0')
            .getMany();
        if (negativeBalances.length > 0) {
            console.warn(`Found ${negativeBalances.length} negative balances:`);
            for (const balance of negativeBalances) {
                console.warn(`User ${balance.user}: balance=${balance.balance}`);
            }
        }
        else {
            console.log('No negative balances found!');
        }
        // Check for decimal bill amounts
        const decimalBills = await transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.billAmount::TEXT LIKE \'%.%\'')
            .getMany();
        if (decimalBills.length > 0) {
            console.warn(`Found ${decimalBills.length} transactions with decimal bill amounts`);
        }
        else {
            console.log('All bill amounts are whole numbers!');
        }
    }
}
exports.DataMigrationService = DataMigrationService;
/**
 * CLI function to run the migration
 */
async function runDataMigration() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'clubcorra',
        entities: [coin_balance_entity_1.CoinBalance, coin_transaction_entity_1.CoinTransaction],
        synchronize: false,
    });
    try {
        await dataSource.initialize();
        console.log('Database connection established');
        const migrationService = new DataMigrationService(dataSource);
        await migrationService.migrateExistingData();
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
    finally {
        await dataSource.destroy();
    }
}
// Run migration if this file is executed directly
if (require.main === module) {
    runDataMigration();
}
