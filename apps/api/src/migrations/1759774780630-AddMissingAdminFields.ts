import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingAdminFields1759774780630 implements MigrationInterface {
    name = 'AddMissingAdminFields1759774780630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coin_balances" ADD "totalEarned" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "coin_balances" ADD "totalRedeemed" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "waitlist_entries" ADD "status" character varying NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "waitlist_entries" ADD "adminNotes" text`);
        await queryRunner.query(`ALTER TABLE "partner_applications" ADD "status" character varying NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "partner_applications" ADD "adminNotes" text`);
        await queryRunner.query(`ALTER TABLE "admins" ADD "status" character varying NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "admins" ADD "lastLoginAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "admins" ADD "refreshTokenHash" character varying`);
        await queryRunner.query(`ALTER TABLE "admins" ADD "permissions" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admins" DROP COLUMN "permissions"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP COLUMN "refreshTokenHash"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP COLUMN "lastLoginAt"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "partner_applications" DROP COLUMN "adminNotes"`);
        await queryRunner.query(`ALTER TABLE "partner_applications" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "waitlist_entries" DROP COLUMN "adminNotes"`);
        await queryRunner.query(`ALTER TABLE "waitlist_entries" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "coin_balances" DROP COLUMN "totalRedeemed"`);
        await queryRunner.query(`ALTER TABLE "coin_balances" DROP COLUMN "totalEarned"`);
    }

}
