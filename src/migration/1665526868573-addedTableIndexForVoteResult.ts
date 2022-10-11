import {MigrationInterface, QueryRunner} from "typeorm";

export class addedTableIndexForVoteResult1665526868573 implements MigrationInterface {
    name = 'addedTableIndexForVoteResult1665526868573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" ADD "tableIndex" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" DROP COLUMN "tableIndex"`);
    }

}
