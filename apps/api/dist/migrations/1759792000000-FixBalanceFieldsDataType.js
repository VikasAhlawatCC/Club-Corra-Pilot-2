"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixBalanceFieldsDataType1759792000000 = void 0;
class FixBalanceFieldsDataType1759792000000 {
    constructor() {
        this.name = 'FixBalanceFieldsDataType1759792000000';
    }
    async up(queryRunner) {
        // Change balance tracking fields from INTEGER to BIGINT to handle large balance values
        await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN previous_balance TYPE BIGINT,
      ALTER COLUMN balance_after_earn TYPE BIGINT,
      ALTER COLUMN balance_after_redeem TYPE BIGINT
    `);
    }
    async down(queryRunner) {
        // Revert balance tracking fields back to INTEGER
        await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN previous_balance TYPE INTEGER,
      ALTER COLUMN balance_after_earn TYPE INTEGER,
      ALTER COLUMN balance_after_redeem TYPE INTEGER
    `);
    }
}
exports.FixBalanceFieldsDataType1759792000000 = FixBalanceFieldsDataType1759792000000;
