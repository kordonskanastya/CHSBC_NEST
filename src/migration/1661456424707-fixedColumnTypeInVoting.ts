import {MigrationInterface, QueryRunner} from "typeorm";

export class fixedColumnTypeInVoting1661456424707 implements MigrationInterface {
    name = 'fixedColumnTypeInVoting1661456424707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "startDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "endDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "endDate" character varying`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "startDate" character varying`);
    }

}
