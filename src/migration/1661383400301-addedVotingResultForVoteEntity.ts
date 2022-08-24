import {MigrationInterface, QueryRunner} from "typeorm";

export class addedVotingResultForVoteEntity1661383400301 implements MigrationInterface {
    name = 'addedVotingResultForVoteEntity1661383400301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_fa847bf8fe909e66876a0f0d289"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "UQ_fa847bf8fe909e66876a0f0d289"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "voteResultId"`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "voteResultId" integer`);
        await queryRunner.query(`ALTER TABLE "voting" ADD CONSTRAINT "UQ_c31f0ec104bf562755f9a917f1c" UNIQUE ("voteResultId")`);
        await queryRunner.query(`ALTER TABLE "voting" ADD CONSTRAINT "FK_c31f0ec104bf562755f9a917f1c" FOREIGN KEY ("voteResultId") REFERENCES "voting-history"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" DROP CONSTRAINT "FK_c31f0ec104bf562755f9a917f1c"`);
        await queryRunner.query(`ALTER TABLE "voting" DROP CONSTRAINT "UQ_c31f0ec104bf562755f9a917f1c"`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "voteResultId"`);
        await queryRunner.query(`ALTER TABLE "students" ADD "voteResultId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "UQ_fa847bf8fe909e66876a0f0d289" UNIQUE ("voteResultId")`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_fa847bf8fe909e66876a0f0d289" FOREIGN KEY ("voteResultId") REFERENCES "voting-history"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
