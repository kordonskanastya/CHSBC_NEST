import { MigrationInterface, QueryRunner } from 'typeorm'

export class groups1654071726480 implements MigrationInterface {
  name = 'groups1654071726480'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "curatorId"`)
    await queryRunner.query(`ALTER TABLE "groups" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "groups" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "groups" ADD "curatorIdId" integer`)
    await queryRunner.query(
      `ALTER TABLE "groups" ADD CONSTRAINT "FK_586bdb4687e22b93b708e3c670d" FOREIGN KEY ("curatorIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_586bdb4687e22b93b708e3c670d"`)
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "curatorIdId"`)
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "updated"`)
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "created"`)
    await queryRunner.query(`ALTER TABLE "groups" ADD "curatorId" integer NOT NULL`)
  }
}
