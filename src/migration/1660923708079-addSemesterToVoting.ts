import {MigrationInterface, QueryRunner} from "typeorm";

export class addSemesterToVoting1660923708079 implements MigrationInterface {
    name = 'addSemesterToVoting1660923708079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ADD "semester" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "semester"`);
    }

}
