import {MigrationInterface, QueryRunner} from "typeorm";

export class addedColumsToGrades1660901799153 implements MigrationInterface {
    name = 'addedColumsToGrades1660901799153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "grades" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP COLUMN "created"`);
    }

}
