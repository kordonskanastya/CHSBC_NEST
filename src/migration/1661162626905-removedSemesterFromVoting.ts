import {MigrationInterface, QueryRunner} from "typeorm";

export class removedSemesterFromVoting1661162626905 implements MigrationInterface {
    name = 'removedSemesterFromVoting1661162626905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "semester"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ADD "semester" integer NOT NULL DEFAULT '1'`);
    }

}
