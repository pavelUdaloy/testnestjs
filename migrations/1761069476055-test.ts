import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1761069476055 implements MigrationInterface {
  name = 'Test1761069476055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "total" integer NOT NULL, "redeemed" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "vouchers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "idempotencyKey" text NOT NULL, "status" text NOT NULL DEFAULT 'REDEEMED', "campaignId" uuid, CONSTRAINT "PK_ed1b7dd909a696560763acdbc04" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vouchers" ADD CONSTRAINT "FK_5aab221bf16e6fb2e22689f4f88" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vouchers" DROP CONSTRAINT "FK_5aab221bf16e6fb2e22689f4f88"`);
    await queryRunner.query(`DROP TABLE "vouchers"`);
    await queryRunner.query(`DROP TABLE "campaigns"`);
  }
}
