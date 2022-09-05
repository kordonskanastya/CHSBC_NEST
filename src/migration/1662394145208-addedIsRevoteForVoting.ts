import {MigrationInterface, QueryRunner} from "typeorm";

export class addedIsRevoteForVoting1662394145208 implements MigrationInterface {
    name = 'addedIsRevoteForVoting1662394145208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_85a196e793df873807f93797491"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92"`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "isRevote" boolean`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_85a196e793df873807f93797491" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92"`);
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_85a196e793df873807f93797491"`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "isRevote"`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_85a196e793df873807f93797491" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
