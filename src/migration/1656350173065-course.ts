import {MigrationInterface, QueryRunner} from "typeorm";

export class course1656350173065 implements MigrationInterface {
    name = 'course1656350173065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "courses" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "credits" integer NOT NULL, "lectureHours" integer NOT NULL, "isActive" boolean NOT NULL, "semester" integer NOT NULL, "isCompulsory" boolean NOT NULL, "teacherId" integer, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses_groups_groups" ("coursesId" integer NOT NULL, "groupsId" integer NOT NULL, CONSTRAINT "PK_99f8b786e4bb8d2684bc32f14dd" PRIMARY KEY ("coursesId", "groupsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c5e50aae84c2361359ea56909a" ON "courses_groups_groups" ("coursesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d36a578873f217fce8345f5f67" ON "courses_groups_groups" ("groupsId") `);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_f921bd9bb6d061b90d386fa3721" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses_groups_groups" ADD CONSTRAINT "FK_c5e50aae84c2361359ea56909a6" FOREIGN KEY ("coursesId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_groups_groups" ADD CONSTRAINT "FK_d36a578873f217fce8345f5f67f" FOREIGN KEY ("groupsId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_groups_groups" DROP CONSTRAINT "FK_d36a578873f217fce8345f5f67f"`);
        await queryRunner.query(`ALTER TABLE "courses_groups_groups" DROP CONSTRAINT "FK_c5e50aae84c2361359ea56909a6"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_f921bd9bb6d061b90d386fa3721"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d36a578873f217fce8345f5f67"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5e50aae84c2361359ea56909a"`);
        await queryRunner.query(`DROP TABLE "courses_groups_groups"`);
        await queryRunner.query(`DROP TABLE "courses"`);
    }

}
