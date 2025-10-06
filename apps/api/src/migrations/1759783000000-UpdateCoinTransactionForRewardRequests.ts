import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateCoinTransactionForRewardRequests1759783000000 implements MigrationInterface {
  name = 'UpdateCoinTransactionForRewardRequests1759783000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to coin_transactions table
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ADD COLUMN bill_amount DECIMAL(10,2) NULL,
      ADD COLUMN coins_earned INTEGER NULL,
      ADD COLUMN coins_redeemed INTEGER NULL,
      ADD COLUMN receipt_url VARCHAR(500) NULL,
      ADD COLUMN admin_notes TEXT NULL,
      ADD COLUMN processed_at TIMESTAMP NULL,
      ADD COLUMN transaction_id VARCHAR(100) NULL,
      ADD COLUMN bill_date DATE NULL,
      ADD COLUMN payment_processed_at TIMESTAMP NULL,
      ADD COLUMN status_updated_at TIMESTAMP NULL
    `)

    // Create enum type first (since it doesn't exist)
    await queryRunner.query(`
      CREATE TYPE coin_transaction_status AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'APPROVED', 'REJECTED', 'PROCESSED', 'PAID')
    `)
    
    // Remove the default value first
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN status DROP DEFAULT
    `)
    
    // Update the column to use the enum
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN status TYPE coin_transaction_status 
      USING status::coin_transaction_status
    `)
    
    // Set the default value back
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN status SET DEFAULT 'PENDING'
    `)

    // Add indexes for performance
    await queryRunner.query(`
      CREATE INDEX idx_coin_tx_bill_date ON coin_transactions(bill_date)
    `)
    await queryRunner.query(`
      CREATE INDEX idx_coin_tx_status ON coin_transactions(status)
    `)
    await queryRunner.query(`
      CREATE INDEX idx_coin_tx_processed_at ON coin_transactions(processed_at)
    `)
    await queryRunner.query(`
      CREATE INDEX idx_coin_tx_payment_processed_at ON coin_transactions(payment_processed_at)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coin_tx_payment_processed_at`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coin_tx_processed_at`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coin_tx_status`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coin_tx_bill_date`)

    // Remove new columns
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      DROP COLUMN IF EXISTS bill_amount,
      DROP COLUMN IF EXISTS coins_earned,
      DROP COLUMN IF EXISTS coins_redeemed,
      DROP COLUMN IF EXISTS receipt_url,
      DROP COLUMN IF EXISTS admin_notes,
      DROP COLUMN IF EXISTS processed_at,
      DROP COLUMN IF EXISTS transaction_id,
      DROP COLUMN IF EXISTS bill_date,
      DROP COLUMN IF EXISTS payment_processed_at,
      DROP COLUMN IF EXISTS status_updated_at
    `)

    // Note: PostgreSQL doesn't support removing enum values easily
    // The new enum values will remain but won't be used
  }
}
