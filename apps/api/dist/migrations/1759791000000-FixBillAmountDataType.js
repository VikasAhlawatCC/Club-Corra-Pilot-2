"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixBillAmountDataType1759791000000 = void 0;
class FixBillAmountDataType1759791000000 {
    constructor() {
        this.name = 'FixBillAmountDataType1759791000000';
    }
    async up(queryRunner) {
        // Fix bill_amount data type from DECIMAL to INTEGER to enforce whole numbers only
        await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN bill_amount TYPE INTEGER USING bill_amount::INTEGER
    `);
    }
    async down(queryRunner) {
        // Revert back to DECIMAL (not recommended but included for completeness)
        await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN bill_amount TYPE DECIMAL(10,2) USING bill_amount::DECIMAL(10,2)
    `);
    }
}
exports.FixBillAmountDataType1759791000000 = FixBillAmountDataType1759791000000;
