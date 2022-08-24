import {MigrationInterface, QueryRunner} from "typeorm";

export class relationsGradeCoursesManyMany1661353510730 implements MigrationInterface {
    name = 'relationsGradeCoursesManyMany1661353510730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc"`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "studentId" TO "gradeId"`);
        await queryRunner.query(`CREATE TABLE "courses_students_students" ("coursesId" integer NOT NULL, "studentsId" integer NOT NULL, CONSTRAINT "PK_cd841c434866a6504aec6bca47c" PRIMARY KEY ("coursesId", "studentsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dffd4341c3ac7907af894f52e1" ON "courses_students_students" ("coursesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6240c191ac91418ffb0891e94c" ON "courses_students_students" ("studentsId") `);
        await queryRunner.query(`ALTER TABLE "grades" DROP COLUMN "courseId"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d03709a9095936a8fc94fa08008" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" ADD CONSTRAINT "FK_dffd4341c3ac7907af894f52e16" FOREIGN KEY ("coursesId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" ADD CONSTRAINT "FK_6240c191ac91418ffb0891e94c5" FOREIGN KEY ("studentsId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_students_students" DROP CONSTRAINT "FK_6240c191ac91418ffb0891e94c5"`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" DROP CONSTRAINT "FK_dffd4341c3ac7907af894f52e16"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d03709a9095936a8fc94fa08008"`);
        await queryRunner.query(`ALTER TABLE "grades" ADD "courseId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6240c191ac91418ffb0891e94c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dffd4341c3ac7907af894f52e1"`);
        await queryRunner.query(`DROP TABLE "courses_students_students"`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "gradeId" TO "studentId"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
