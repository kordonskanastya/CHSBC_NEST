import {MigrationInterface, QueryRunner} from "typeorm";

export class fixGetAllCourses1660395167774 implements MigrationInterface {
    name = 'fixGetAllCourses1660395167774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ADD "studentId" integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "studentId"`);
    }

}
