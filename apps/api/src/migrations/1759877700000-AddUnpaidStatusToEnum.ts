import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUnpaidStatusToEnum1759877700000 implements MigrationInterface {
  name = 'AddUnpaidStatusToEnum1759877700000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if UNPAID value already exists in the enum
    const result = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'UNPAID' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'coin_transaction_status')
      ) as exists
    `)

    // Only add UNPAID if it doesn't exist
    if (!result[0].exists) {
      await queryRunner.query(`
        ALTER TYPE coin_transaction_status ADD VALUE IF NOT EXISTS 'UNPAID'
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't support removing enum values
    // The UNPAID value will remain but won't be used
    // If you really need to remove it, you'll need to recreate the enum
  }
}

