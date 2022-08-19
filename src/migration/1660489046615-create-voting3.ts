import {MigrationInterface, QueryRunner} from "typeorm";

export class createVoting31660489046615 implements MigrationInterface {
    name = 'createVoting31660489046615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ALTER COLUMN "startDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "voting" ALTER COLUMN "endDate" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ALTER COLUMN "endDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "voting" ALTER COLUMN "startDate" SET NOT NULL`);
    }

}
