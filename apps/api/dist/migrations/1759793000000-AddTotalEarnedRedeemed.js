"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTotalEarnedRedeemed1759793000000 = void 0;
class AddTotalEarnedRedeemed1759793000000 {
    constructor() {
        this.name = 'AddTotalEarnedRedeemed1759793000000';
    }
    async up(queryRunner) {
        // Add total_earned and total_redeemed columns to coin_balances table
        await queryRunner.query(`
      ALTER TABLE coin_balances 
      ADD COLUMN IF NOT EXISTS total_earned BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_redeemed BIGINT NOT NULL DEFAULT 0
    `);
    }
    async down(queryRunner) {
        // Remove total_earned and total_redeemed columns from coin_balances table
        await queryRunner.query(`
      ALTER TABLE coin_balances 
      DROP COLUMN IF EXISTS total_earned,
      DROP COLUMN IF EXISTS total_redeemed
    `);
    }
}
exports.AddTotalEarnedRedeemed1759793000000 = AddTotalEarnedRedeemed1759793000000;
