import { MigrationInterface, QueryRunner } from 'typeorm'

export class init1651146863132 implements MigrationInterface {
  name = 'init1651146863132'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying(200), "lastName" character varying(200), "login" character varying(200) NOT NULL, "email" character varying(320), "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "status" boolean NOT NULL DEFAULT true, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "refreshTokenList" jsonb, CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "loggers" ("id" SERIAL NOT NULL, "event" character varying NOT NULL, "before" jsonb, "after" jsonb, "entity" character varying NOT NULL, "entityId" integer, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_29e8f8af58645b7a782e3694a1a" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "images" ("id" SERIAL NOT NULL, "fileName" character varying(500) NOT NULL, "fileSize" integer DEFAULT '0', "originalName" character varying(500) NOT NULL, "mimeType" character varying(100) NOT NULL, "entity" character varying NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "loggers" ADD CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "FK_96514329909c945f10974aff5f8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_96514329909c945f10974aff5f8"`)
    await queryRunner.query(`ALTER TABLE "loggers" DROP CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0"`)
    await queryRunner.query(`DROP TABLE "images"`)
    await queryRunner.query(`DROP TABLE "loggers"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
