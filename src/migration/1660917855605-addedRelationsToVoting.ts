import {MigrationInterface, QueryRunner} from "typeorm";

export class addedRelationsToVoting1660917855605 implements MigrationInterface {
    name = 'addedRelationsToVoting1660917855605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ADD "tookPart" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "students" ADD "voteId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "voteId"`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "tookPart"`);
    }

}
