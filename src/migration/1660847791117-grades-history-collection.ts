import { MigrationInterface, QueryRunner } from 'typeorm'

export class gradesHistoryCollection1660847791117 implements MigrationInterface {
  name = 'gradesHistoryCollection1660847791117'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "grades-history" ("id" SERIAL NOT NULL, "grade" integer NOT NULL DEFAULT '0', "reasonOfChange" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "studentId" integer, "courseId" integer, "userChangedId" integer, CONSTRAINT "PK_6c3c719eed8a493993ae587b3b3" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "grades-history" ADD CONSTRAINT "FK_3f1ebc518e8044040df84641d9f" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "grades-history" ADD CONSTRAINT "FK_d8d226f5484c891cf586cd33116" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "grades-history" ADD CONSTRAINT "FK_649d9476e287977d1d6ffe8a37d" FOREIGN KEY ("userChangedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "grades-history" DROP CONSTRAINT "FK_649d9476e287977d1d6ffe8a37d"`)
    await queryRunner.query(`ALTER TABLE "grades-history" DROP CONSTRAINT "FK_d8d226f5484c891cf586cd33116"`)
    await queryRunner.query(`ALTER TABLE "grades-history" DROP CONSTRAINT "FK_3f1ebc518e8044040df84641d9f"`)
    await queryRunner.query(`DROP TABLE "grades-history"`)
  }
}
