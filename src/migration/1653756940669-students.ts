import { MigrationInterface, QueryRunner } from 'typeorm'

export class students1653756940669 implements MigrationInterface {
  name = 'students1653756940669'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "students" ("id" SERIAL NOT NULL, "dateOfBirth" character varying(10) NOT NULL, "orderNumber" character varying(20) NOT NULL, "edeboId" character varying(8) NOT NULL, "isFullTime" boolean NOT NULL, "groupIdId" integer, "userIdId" integer, CONSTRAINT "REL_cc65c917a3b4f2d8230c948067" UNIQUE ("userIdId"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "students" ADD CONSTRAINT "FK_69f856a42188e4445f34986ce75" FOREIGN KEY ("groupIdId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "students" ADD CONSTRAINT "FK_cc65c917a3b4f2d8230c948067c" FOREIGN KEY ("userIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc65c917a3b4f2d8230c948067c"`)
    await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_69f856a42188e4445f34986ce75"`)
    await queryRunner.query(`DROP TABLE "students"`)
  }
}
