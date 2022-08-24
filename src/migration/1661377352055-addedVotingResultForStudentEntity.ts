import {MigrationInterface, QueryRunner} from "typeorm";

export class addedVotingResultForStudentEntity1661377352055 implements MigrationInterface {
    name = 'addedVotingResultForStudentEntity1661377352055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" ADD "voteResultId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "UQ_fa847bf8fe909e66876a0f0d289" UNIQUE ("voteResultId")`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_fa847bf8fe909e66876a0f0d289" FOREIGN KEY ("voteResultId") REFERENCES "voting-history"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_fa847bf8fe909e66876a0f0d289"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "UQ_fa847bf8fe909e66876a0f0d289"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "voteResultId"`);
    }

}
