import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixBalanceFieldsDataType1759792000000 implements MigrationInterface {
  name = 'FixBalanceFieldsDataType1759792000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change balance tracking fields from INTEGER to BIGINT to handle large balance values
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN previous_balance TYPE BIGINT,
      ALTER COLUMN balance_after_earn TYPE BIGINT,
      ALTER COLUMN balance_after_redeem TYPE BIGINT
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert balance tracking fields back to INTEGER
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN previous_balance TYPE INTEGER,
      ALTER COLUMN balance_after_earn TYPE INTEGER,
      ALTER COLUMN balance_after_redeem TYPE INTEGER
    `)
  }
}
