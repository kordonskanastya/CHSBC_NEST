import {MigrationInterface, QueryRunner} from "typeorm";

export class addedVotingResultForStudent1661367313836 implements MigrationInterface {
    name = 'addedVotingResultForStudent1661367313836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "voting-history" ("id" SERIAL NOT NULL, "isVoted" boolean NOT NULL DEFAULT false, "studentId" integer, "voteId" integer, CONSTRAINT "REL_1197db724438c46060c425a1a8" UNIQUE ("studentId"), CONSTRAINT "REL_1fd4b9778fe8025068f4328cc1" UNIQUE ("voteId"), CONSTRAINT "PK_defbf1846955ccf6bb87fbb4e55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "voting-history" ADD CONSTRAINT "FK_1197db724438c46060c425a1a8a" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "voting-history" ADD CONSTRAINT "FK_1fd4b9778fe8025068f4328cc16" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-history" DROP CONSTRAINT "FK_1fd4b9778fe8025068f4328cc16"`);
        await queryRunner.query(`ALTER TABLE "voting-history" DROP CONSTRAINT "FK_1197db724438c46060c425a1a8a"`);
        await queryRunner.query(`DROP TABLE "voting-history"`);
    }

}
