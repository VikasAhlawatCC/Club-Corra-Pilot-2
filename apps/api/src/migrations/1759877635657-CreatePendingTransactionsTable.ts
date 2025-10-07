import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreatePendingTransactionsTable1759877635657 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
      true
    )

    // Create indexes
    await queryRunner.createIndex(
      'pending_transactions',
      new TableIndex({
        name: 'idx_pending_tx_session_id',
        columnNames: ['session_id'],
      })
    )

    await queryRunner.createIndex(
      'pending_transactions',
      new TableIndex({
        name: 'idx_pending_tx_claimed_by',
        columnNames: ['claimed_by'],
      })
    )

    await queryRunner.createIndex(
      'pending_transactions',
      new TableIndex({
        name: 'idx_pending_tx_expires_at',
        columnNames: ['expires_at'],
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pending_transactions')
  }
}
