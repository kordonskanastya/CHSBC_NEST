import {MigrationInterface, QueryRunner} from "typeorm";

export class addedIsApprovedForVoting1664859621307 implements MigrationInterface {
    name = 'addedIsApprovedForVoting1664859621307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ADD "isApproved" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "isApproved"`);
    }

}
