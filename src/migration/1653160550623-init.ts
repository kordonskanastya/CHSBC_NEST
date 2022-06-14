import { MigrationInterface, QueryRunner } from 'typeorm'

export class init1653160550623 implements MigrationInterface {
  name = 'init1653160550623'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying(200), "lastName" character varying(200), "email" character varying(320), "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'student', "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "refreshTokenList" jsonb, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "loggers" ("id" SERIAL NOT NULL, "event" character varying NOT NULL, "before" jsonb, "after" jsonb, "entity" character varying NOT NULL, "entityId" integer, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_29e8f8af58645b7a782e3694a1a" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "groups" ("id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, "curatorId" integer NOT NULL, "orderNumber" character varying NOT NULL, "deletedOrderNumber" character varying, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "loggers" ADD CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "loggers" DROP CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0"`)
    await queryRunner.query(`DROP TABLE "groups"`)
    await queryRunner.query(`DROP TABLE "loggers"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
