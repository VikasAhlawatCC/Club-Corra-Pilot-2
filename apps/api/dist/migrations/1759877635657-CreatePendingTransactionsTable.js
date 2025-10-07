"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePendingTransactionsTable1759877635657 = void 0;
const typeorm_1 = require("typeorm");
class CreatePendingTransactionsTable1759877635657 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'pending_transactions',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'session_id',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'brand_id',
                    type: 'uuid',
                    isNullable: false,
                },
                {
                    name: 'bill_amount',
                    type: 'int',
                    isNullable: false,
                },
                {
                    name: 'receipt_url',
                    type: 'varchar',
                    length: '500',
                    isNullable: false,
                },
                {
                    name: 'file_name',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'expires_at',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                    isNullable: false,
                },
                {
                    name: 'claimed',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'claimed_by',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'claimed_at',
                    type: 'timestamptz',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamptz',
                    default: 'now()',
                    isNullable: false,
                },
                {
                    name: 'updated_at',
                    type: 'timestamptz',
                    default: 'now()',
                    isNullable: false,
                },
            ],
        }), true);
        // Create indexes
        await queryRunner.createIndex('pending_transactions', new typeorm_1.TableIndex({
            name: 'idx_pending_tx_session_id',
            columnNames: ['session_id'],
        }));
        await queryRunner.createIndex('pending_transactions', new typeorm_1.TableIndex({
            name: 'idx_pending_tx_claimed_by',
            columnNames: ['claimed_by'],
        }));
        await queryRunner.createIndex('pending_transactions', new typeorm_1.TableIndex({
            name: 'idx_pending_tx_expires_at',
            columnNames: ['expires_at'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('pending_transactions');
    }
}
exports.CreatePendingTransactionsTable1759877635657 = CreatePendingTransactionsTable1759877635657;
