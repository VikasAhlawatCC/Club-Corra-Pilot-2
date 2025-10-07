#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../data-source");
async function seedRealisticTransactions() {
    try {
        console.log('🚀 Starting realistic transaction seeding...');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connection established');
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        // Get all users and brands
        const users = await queryRunner.query('SELECT id FROM users LIMIT 20');
        const brands = await queryRunner.query(`
      SELECT id, name, "earningPercentage", "redemptionPercentage", "maxRedemptionAmount"
      FROM brands 
      WHERE "isActive" = true 
      LIMIT 10
    `);
        if (users.length === 0 || brands.length === 0) {
            console.log('❌ No users or brands found. Please seed users and brands first.');
            return;
        }
        console.log(`📊 Found ${users.length} users and ${brands.length} brands`);
        // Clear existing transactions
        await queryRunner.query('DELETE FROM coin_transactions');
        await queryRunner.query('UPDATE coin_balances SET balance = 0, "totalEarned" = 0, "totalRedeemed" = 0');
        const transactionInserts = [];
        // Generate realistic transactions for each user
        for (const user of users) {
            const userTransactions = Math.floor(Math.random() * 15) + 5; // 5-20 transactions per user
            for (let i = 0; i < userTransactions; i++) {
                const brand = brands[Math.floor(Math.random() * brands.length)];
                const earningPercentage = parseFloat(brand.earningPercentage);
                const redemptionPercentage = parseFloat(brand.redemptionPercentage);
                // Generate realistic bill amount (₹50 to ₹5000)
                const billAmount = Math.floor(Math.random() * 4950) + 50;
                // Calculate coins earned based on brand's earning percentage
                const coinsEarned = Math.max(1, Math.round((billAmount * earningPercentage) / 100));
                // Determine if user wants to redeem (30% chance)
                const willRedeem = Math.random() < 0.3;
                let coinsRedeemed = 0;
                if (willRedeem) {
                    // Calculate max possible redemption (10% of bill amount or user's current balance)
                    const maxRedeemFromBill = Math.floor(billAmount * 0.1);
                    const maxRedeemFromBalance = Math.floor(Math.random() * 1000) + 50; // Simulate user balance
                    const maxRedeem = Math.min(maxRedeemFromBill, maxRedeemFromBalance, brand.maxRedemptionAmount || 1000);
                    coinsRedeemed = Math.floor(Math.random() * maxRedeem) + 1;
                }
                // Calculate net amount
                const netAmount = coinsEarned - coinsRedeemed;
                // Generate transaction status (weighted towards realistic distribution)
                const statusWeights = {
                    'PENDING': 0.15,
                    'APPROVED': 0.25,
                    'REJECTED': 0.10,
                    'PROCESSED': 0.20,
                    'PAID': 0.20,
                    'COMPLETED': 0.10
                };
                const status = getWeightedRandomStatus(statusWeights);
                // Generate dates (transactions from last 3 months)
                const daysAgo = Math.floor(Math.random() * 90);
                const createdAt = `NOW() - INTERVAL '${daysAgo} days'`;
                let statusUpdatedAt = 'NULL';
                let processedAt = 'NULL';
                if (status !== 'PENDING') {
                    const statusDaysAgo = Math.floor(Math.random() * daysAgo);
                    statusUpdatedAt = `NOW() - INTERVAL '${statusDaysAgo} days'`;
                    if (['APPROVED', 'REJECTED', 'PROCESSED', 'PAID'].includes(status)) {
                        processedAt = `NOW() - INTERVAL '${statusDaysAgo} days'`;
                    }
                }
                // Generate receipt URL
                const receiptUrl = `https://example.com/receipts/receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
                // Generate bill date (within last 3 months)
                const billDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
                const billDateStr = billDate.toISOString().split('T')[0];
                transactionInserts.push(`(
          '${user.id}',
          '${brand.id}',
          '${netAmount}',
          'REWARD_REQUEST',
          '${status}',
          '${billAmount}',
          '${coinsEarned}',
          '${coinsRedeemed}',
          '${receiptUrl}',
          '${billDateStr}',
          ${createdAt},
          ${statusUpdatedAt},
          ${processedAt}
        )`);
            }
        }
        // Insert all transactions
        if (transactionInserts.length > 0) {
            await queryRunner.query(`
        INSERT INTO coin_transactions (
          "userId", "brandId", "amount", "type", "status",
          "bill_amount", "coins_earned", "coins_redeemed", "receipt_url", "bill_date",
          "createdAt", "status_updated_at", "processed_at"
        )
        VALUES ${transactionInserts.join(', ')}
      `);
        }
        // Update user balances based on transactions
        await updateUserBalances(queryRunner, users);
        console.log('🎉 Realistic transaction seeding completed successfully!');
        console.log(`📊 Created ${transactionInserts.length} transactions`);
        await queryRunner.release();
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}
function getWeightedRandomStatus(weights) {
    const random = Math.random();
    let cumulative = 0;
    for (const [status, weight] of Object.entries(weights)) {
        cumulative += weight;
        if (random <= cumulative) {
            return status;
        }
    }
    return 'PENDING';
}
async function updateUserBalances(queryRunner, users) {
    console.log('💰 Updating user balances...');
    for (const user of users) {
        // Get all transactions for this user
        const transactions = await queryRunner.query(`
      SELECT "coins_earned", "coins_redeemed", status 
      FROM coin_transactions 
      WHERE "userId" = '${user.id}'
    `);
        let totalEarned = 0;
        let totalRedeemed = 0;
        for (const tx of transactions) {
            if (tx.coins_earned)
                totalEarned += tx.coins_earned;
            if (tx.coins_redeemed)
                totalRedeemed += tx.coins_redeemed;
        }
        const currentBalance = totalEarned - totalRedeemed;
        // Check if balance record exists
        const existingBalance = await queryRunner.query(`
      SELECT id FROM coin_balances WHERE "userId" = '${user.id}'
    `);
        if (existingBalance.length > 0) {
            // Update existing balance
            await queryRunner.query(`
        UPDATE coin_balances 
        SET balance = '${currentBalance}', "totalEarned" = '${totalEarned}', "totalRedeemed" = '${totalRedeemed}'
        WHERE "userId" = '${user.id}'
      `);
        }
        else {
            // Create new balance record
            await queryRunner.query(`
        INSERT INTO coin_balances ("userId", balance, "totalEarned", "totalRedeemed")
        VALUES ('${user.id}', '${currentBalance}', '${totalEarned}', '${totalRedeemed}')
      `);
        }
    }
}
seedRealisticTransactions();
