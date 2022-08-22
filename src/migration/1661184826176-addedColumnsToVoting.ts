import {MigrationInterface, QueryRunner} from "typeorm";

export class addedColumnsToVoting1661184826176 implements MigrationInterface {
    name = 'addedColumnsToVoting1661184826176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ADD "status" character varying`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "created"`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "status"`);
    }

}
