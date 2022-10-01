import {MigrationInterface, QueryRunner} from "typeorm";

export class fixCoursesType1664622560277 implements MigrationInterface {
    name = 'fixCoursesType1664622560277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "isCompulsory" TO "type"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "type" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "type" TO "isCompulsory"`);
    }

}
