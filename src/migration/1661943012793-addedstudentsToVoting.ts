import {MigrationInterface, QueryRunner} from "typeorm";

export class addedstudentsToVoting1661943012793 implements MigrationInterface {
    name = 'addedstudentsToVoting1661943012793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" ADD "voteId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "voteId"`);
    }

}
