import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsExamToCourses1658326580796 implements MigrationInterface {
    name = 'addIsExamToCourses1658326580796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ADD "isExam" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "isExam"`);
    }

}
