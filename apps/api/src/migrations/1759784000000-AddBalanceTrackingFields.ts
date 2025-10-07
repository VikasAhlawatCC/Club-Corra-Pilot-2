import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBalanceTrackingFields1759784000000 implements MigrationInterface {
  name = 'AddBalanceTrackingFields1759784000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add balance tracking fields for reversion on rejection
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ADD COLUMN previous_balance INTEGER NULL,
      ADD COLUMN balance_after_earn INTEGER NULL,
      ADD COLUMN balance_after_redeem INTEGER NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove balance tracking fields
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      DROP COLUMN previous_balance,
      DROP COLUMN balance_after_earn,
      DROP COLUMN balance_after_redeem
    `)
  }
}
