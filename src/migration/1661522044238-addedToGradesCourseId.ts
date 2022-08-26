import {MigrationInterface, QueryRunner} from "typeorm";

export class addedToGradesCourseId1661522044238 implements MigrationInterface {
    name = 'addedToGradesCourseId1661522044238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" ADD "courseId" integer`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "UQ_ff09424ef05361e1c47fa03d82b" UNIQUE ("courseId")`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "UQ_ff09424ef05361e1c47fa03d82b"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP COLUMN "courseId"`);
    }

}
