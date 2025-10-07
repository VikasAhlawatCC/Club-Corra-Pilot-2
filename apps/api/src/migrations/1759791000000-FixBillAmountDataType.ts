import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixBillAmountDataType1759791000000 implements MigrationInterface {
  name = 'FixBillAmountDataType1759791000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix bill_amount data type from DECIMAL to INTEGER to enforce whole numbers only
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN bill_amount TYPE INTEGER USING bill_amount::INTEGER
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to DECIMAL (not recommended but included for completeness)
    await queryRunner.query(`
      ALTER TABLE coin_transactions 
      ALTER COLUMN bill_amount TYPE DECIMAL(10,2) USING bill_amount::DECIMAL(10,2)
    `)
  }
}
