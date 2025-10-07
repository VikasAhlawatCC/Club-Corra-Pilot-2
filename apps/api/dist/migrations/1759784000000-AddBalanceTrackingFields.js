"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBalanceTrackingFields1759784000000 = void 0;
class AddBalanceTrackingFields1759784000000 {
    constructor() {
        this.name = 'AddBalanceTrackingFields1759784000000';
    }
    async up(queryRunner) {
        // Add balance tracking fields for reversion on rejection
        await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ADD COLUMN previous_balance INTEGER NULL,
      ADD COLUMN balance_after_earn INTEGER NULL,
      ADD COLUMN balance_after_redeem INTEGER NULL
    `);
    }
    async down(queryRunner) {
        // Remove balance tracking fields
        await queryRunner.query(`
      ALTER TABLE coin_transactions 
      DROP COLUMN previous_balance,
      DROP COLUMN balance_after_earn,
      DROP COLUMN balance_after_redeem
    `);
    }
}
exports.AddBalanceTrackingFields1759784000000 = AddBalanceTrackingFields1759784000000;
