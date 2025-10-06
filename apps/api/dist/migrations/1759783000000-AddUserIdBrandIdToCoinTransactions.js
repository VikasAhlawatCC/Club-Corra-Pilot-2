"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserIdBrandIdToCoinTransactions1759783000000 = void 0;
class AddUserIdBrandIdToCoinTransactions1759783000000 {
    constructor() {
        this.name = 'AddUserIdBrandIdToCoinTransactions1759783000000';
    }
    async up(queryRunner) {
        // Add userId column
        await queryRunner.query(`ALTER TABLE "coin_transactions" ADD "userId" uuid`);
        // Add brandId column  
        await queryRunner.query(`ALTER TABLE "coin_transactions" ADD "brandId" uuid`);
        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "coin_transactions" ADD CONSTRAINT "FK_coin_transactions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coin_transactions" ADD CONSTRAINT "FK_coin_transactions_brand" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        // Add indexes
        await queryRunner.query(`CREATE INDEX "idx_coin_tx_user_id" ON "coin_transactions" ("userId")`);
        await queryRunner.query(`CREATE INDEX "idx_coin_tx_brand_id" ON "coin_transactions" ("brandId")`);
    }
    async down(queryRunner) {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "idx_coin_tx_brand_id"`);
        await queryRunner.query(`DROP INDEX "idx_coin_tx_user_id"`);
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "coin_transactions" DROP CONSTRAINT "FK_coin_transactions_brand"`);
        await queryRunner.query(`ALTER TABLE "coin_transactions" DROP CONSTRAINT "FK_coin_transactions_user"`);
        // Drop columns
        await queryRunner.query(`ALTER TABLE "coin_transactions" DROP COLUMN "brandId"`);
        await queryRunner.query(`ALTER TABLE "coin_transactions" DROP COLUMN "userId"`);
    }
}
exports.AddUserIdBrandIdToCoinTransactions1759783000000 = AddUserIdBrandIdToCoinTransactions1759783000000;
