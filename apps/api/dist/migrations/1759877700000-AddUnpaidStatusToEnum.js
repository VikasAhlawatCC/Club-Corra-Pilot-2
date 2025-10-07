"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUnpaidStatusToEnum1759877700000 = void 0;
class AddUnpaidStatusToEnum1759877700000 {
    constructor() {
        this.name = 'AddUnpaidStatusToEnum1759877700000';
    }
    async up(queryRunner) {
        // Check if UNPAID value already exists in the enum
        const result = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'UNPAID' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'coin_transaction_status')
      ) as exists
    `);
        // Only add UNPAID if it doesn't exist
        if (!result[0].exists) {
            await queryRunner.query(`
        ALTER TYPE coin_transaction_status ADD VALUE IF NOT EXISTS 'UNPAID'
      `);
        }
    }
    async down(queryRunner) {
        // Note: PostgreSQL doesn't support removing enum values
        // The UNPAID value will remain but won't be used
        // If you really need to remove it, you'll need to recreate the enum
    }
}
exports.AddUnpaidStatusToEnum1759877700000 = AddUnpaidStatusToEnum1759877700000;
