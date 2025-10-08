import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTotalEarnedRedeemed1759793000000 implements MigrationInterface {
  name = 'AddTotalEarnedRedeemed1759793000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add total_earned and total_redeemed columns to coin_balances table
    await queryRunner.query(`
      ALTER TABLE coin_balances 
      ADD COLUMN IF NOT EXISTS total_earned BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_redeemed BIGINT NOT NULL DEFAULT 0
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove total_earned and total_redeemed columns from coin_balances table
    await queryRunner.query(`
      ALTER TABLE coin_balances 
      DROP COLUMN IF EXISTS total_earned,
      DROP COLUMN IF EXISTS total_redeemed
    `)
  }
}


