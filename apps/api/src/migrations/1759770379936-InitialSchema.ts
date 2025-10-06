import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759770379936 implements MigrationInterface {
    name = 'InitialSchema1759770379936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "firstName" character varying, "lastName" character varying, "user_id" uuid, CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "upiId" character varying, "mobileNumber" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_238f94299cde6f8b43db0e3423" UNIQUE ("userId"), CONSTRAINT "PK_309f873cfbc20f57796956a1d33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auth_providers_provider_enum" AS ENUM('SMS', 'EMAIL', 'GOOGLE', 'FACEBOOK')`);
        await queryRunner.query(`CREATE TABLE "auth_providers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "provider" "public"."auth_providers_provider_enum" NOT NULL, "providerId" character varying NOT NULL, "email" character varying, "linkedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cb277e892a115855fc95c373422" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coin_balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "balance" bigint NOT NULL DEFAULT '0', "userId" uuid, CONSTRAINT "PK_76ef5f715abe09654b66c2e08ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_coin_balance_user_id" ON "coin_balances" ("userId") `);
        await queryRunner.query(`CREATE TABLE "brand_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "icon" character varying, "color" character varying, CONSTRAINT "PK_a5679657f29fc875a5c97abfbf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandId" uuid NOT NULL, "name" character varying NOT NULL, "address" text, "city" character varying, "state" character varying, "postalCode" character varying, "latitude" numeric(10,7), "longitude" numeric(10,7), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandId" uuid NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "termsAndConditions" text, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text NOT NULL, "logoUrl" character varying(500), "categoryId" uuid, "earningPercentage" numeric(5,2) NOT NULL DEFAULT '10', "redemptionPercentage" numeric(5,2) NOT NULL DEFAULT '30', "minRedemptionAmount" integer NOT NULL DEFAULT '1', "maxRedemptionAmount" integer NOT NULL DEFAULT '2000', "brandwiseMaxCap" integer NOT NULL DEFAULT '2000', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coin_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "amount" bigint NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "userId" uuid, "brandId" uuid, CONSTRAINT "PK_7dad7cc20e8e6f4700b04928e12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_coin_tx_user_id" ON "coin_transactions" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."files_type_enum" AS ENUM('RECEIPT', 'PROFILE_PICTURE', 'DOCUMENT', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "fileName" character varying NOT NULL, "originalName" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "url" character varying NOT NULL, "type" "public"."files_type_enum" NOT NULL DEFAULT 'OTHER', "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "mobileNumber" character varying NOT NULL, "email" character varying, "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING', "isMobileVerified" boolean NOT NULL DEFAULT false, "isEmailVerified" boolean NOT NULL DEFAULT false, "hasWelcomeBonusProcessed" boolean DEFAULT false, "passwordHash" character varying, "refreshTokenHash" character varying, "emailVerificationToken" character varying, "emailVerificationExpiresAt" TIMESTAMP, "passwordResetToken" character varying, "passwordResetExpiresAt" TIMESTAMP, "lastLoginAt" TIMESTAMP, "roles" text NOT NULL DEFAULT 'USER', "profileId" uuid, "paymentDetailsId" uuid, "firebaseUid" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_61dc14c8c49c187f5d08047c98" ON "users" ("mobileNumber") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e621f267079194e5428e19af2f" ON "users" ("firebaseUid") `);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('TRANSACTION_APPROVED', 'TRANSACTION_REJECTED', 'PAYMENT_PROCESSED', 'REWARD_EARNED', 'SYSTEM', 'PROMOTIONAL')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "data" jsonb, "isRead" boolean NOT NULL DEFAULT false, "readAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "waitlist_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying NOT NULL, "source" character varying, CONSTRAINT "PK_bd0ef66fff81d3be7b7a1568a4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "partner_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "companyName" character varying NOT NULL, "contactEmail" character varying NOT NULL, "details" jsonb, CONSTRAINT "PK_9c52c1e24235ece37d592db8297" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "role" character varying NOT NULL DEFAULT 'ADMIN', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "saved_views" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "config" jsonb NOT NULL, "ownerId" uuid, CONSTRAINT "PK_30acd4fbe2058d97631ab9bb2b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "risk_signals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "signal" character varying NOT NULL, "metadata" jsonb, "userId" uuid, CONSTRAINT "PK_35e1dd1b73eb880456f17820cf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "experiment_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "key" character varying NOT NULL, "value" jsonb NOT NULL, CONSTRAINT "UQ_c10ff5815e0d986c5dd49d9dd59" UNIQUE ("key"), CONSTRAINT "PK_6aad5b245c0363feaa0691b3df7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."financial_reconciliation_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "financial_reconciliation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandId" character varying NOT NULL, "brandName" character varying NOT NULL, "pendingAmount" numeric(10,2) NOT NULL, "settledAmount" numeric(10,2) NOT NULL DEFAULT '0', "lastSettlementDate" TIMESTAMP, "nextSettlementDate" TIMESTAMP NOT NULL, "status" "public"."financial_reconciliation_status_enum" NOT NULL DEFAULT 'pending', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_396e668ad2113916af715b234b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dashboard_metrics_cache" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "key" character varying NOT NULL, "value" jsonb NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_26747c7fe2e67e22e41da51a927" UNIQUE ("key"), CONSTRAINT "PK_ec58b320143d16544708378adde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "action" character varying NOT NULL, "details" jsonb, "actorId" uuid, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_details" ADD CONSTRAINT "FK_238f94299cde6f8b43db0e3423a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth_providers" ADD CONSTRAINT "FK_eb4fd6d0f3ad537effb4cb7505a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coin_balances" ADD CONSTRAINT "FK_41375ba3cf636acd8bfa009ba8e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "locations" ADD CONSTRAINT "FK_ae000f5f68d676500a41a73c8bc" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_128f840744fe8da7a134171d558" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "FK_b209d7ccd90ae0ca1605794a0d5" FOREIGN KEY ("categoryId") REFERENCES "brand_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coin_transactions" ADD CONSTRAINT "FK_9332e2b867f91fba0642b781af8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coin_transactions" ADD CONSTRAINT "FK_44503460d32a68307ec82ab6feb" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_7e7425b17f9e707331e9a6c7335" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_views" ADD CONSTRAINT "FK_b1a4bbe136fd0fd124e5b76fe63" FOREIGN KEY ("ownerId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "risk_signals" ADD CONSTRAINT "FK_439df5fdb3125443046ed0980df" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_2dc33f7f3c22e2e7badafca1d12" FOREIGN KEY ("actorId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_2dc33f7f3c22e2e7badafca1d12"`);
        await queryRunner.query(`ALTER TABLE "risk_signals" DROP CONSTRAINT "FK_439df5fdb3125443046ed0980df"`);
        await queryRunner.query(`ALTER TABLE "saved_views" DROP CONSTRAINT "FK_b1a4bbe136fd0fd124e5b76fe63"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_7e7425b17f9e707331e9a6c7335"`);
        await queryRunner.query(`ALTER TABLE "coin_transactions" DROP CONSTRAINT "FK_44503460d32a68307ec82ab6feb"`);
        await queryRunner.query(`ALTER TABLE "coin_transactions" DROP CONSTRAINT "FK_9332e2b867f91fba0642b781af8"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_b209d7ccd90ae0ca1605794a0d5"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_128f840744fe8da7a134171d558"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP CONSTRAINT "FK_ae000f5f68d676500a41a73c8bc"`);
        await queryRunner.query(`ALTER TABLE "coin_balances" DROP CONSTRAINT "FK_41375ba3cf636acd8bfa009ba8e"`);
        await queryRunner.query(`ALTER TABLE "auth_providers" DROP CONSTRAINT "FK_eb4fd6d0f3ad537effb4cb7505a"`);
        await queryRunner.query(`ALTER TABLE "payment_details" DROP CONSTRAINT "FK_238f94299cde6f8b43db0e3423a"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "dashboard_metrics_cache"`);
        await queryRunner.query(`DROP TABLE "financial_reconciliation"`);
        await queryRunner.query(`DROP TYPE "public"."financial_reconciliation_status_enum"`);
        await queryRunner.query(`DROP TABLE "experiment_configs"`);
        await queryRunner.query(`DROP TABLE "risk_signals"`);
        await queryRunner.query(`DROP TABLE "saved_views"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "partner_applications"`);
        await queryRunner.query(`DROP TABLE "waitlist_entries"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e621f267079194e5428e19af2f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61dc14c8c49c187f5d08047c98"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TYPE "public"."files_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_coin_tx_user_id"`);
        await queryRunner.query(`DROP TABLE "coin_transactions"`);
        await queryRunner.query(`DROP TABLE "brands"`);
        await queryRunner.query(`DROP TABLE "offers"`);
        await queryRunner.query(`DROP TABLE "locations"`);
        await queryRunner.query(`DROP TABLE "brand_categories"`);
        await queryRunner.query(`DROP INDEX "public"."idx_coin_balance_user_id"`);
        await queryRunner.query(`DROP TABLE "coin_balances"`);
        await queryRunner.query(`DROP TABLE "auth_providers"`);
        await queryRunner.query(`DROP TYPE "public"."auth_providers_provider_enum"`);
        await queryRunner.query(`DROP TABLE "payment_details"`);
        await queryRunner.query(`DROP TABLE "user_profiles"`);
    }

}
