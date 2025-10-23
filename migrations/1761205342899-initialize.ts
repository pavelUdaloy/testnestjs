import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initialize1761205342899 implements MigrationInterface {
  name = 'Initialize1761205342899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "total" integer NOT NULL, "redeemed" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d32021d5791ed1617efaf1ac688" UNIQUE ("name"), CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "campaign_voucher_redeems" ("userId" uuid NOT NULL, "campaignId" uuid NOT NULL, "idempotencyKey" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6f375c41c553b286a3d61a28c8d" PRIMARY KEY ("userId", "campaignId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_voucher_redeems" ADD CONSTRAINT "FK_d36aa067df211924e222387d342" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaign_voucher_redeems" DROP CONSTRAINT "FK_d36aa067df211924e222387d342"`);
    await queryRunner.query(`DROP TABLE "campaign_voucher_redeems"`);
    await queryRunner.query(`DROP TABLE "campaigns"`);
  }
}
