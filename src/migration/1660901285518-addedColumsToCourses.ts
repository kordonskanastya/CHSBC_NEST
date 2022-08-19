import {MigrationInterface, QueryRunner} from "typeorm";

export class addedColumsToCourses1660901285518 implements MigrationInterface {
    name = 'addedColumsToCourses1660901285518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "created"`);
    }

}
