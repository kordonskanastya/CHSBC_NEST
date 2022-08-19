import {MigrationInterface, QueryRunner} from "typeorm";

export class addedGroupsToVoting1660633126451 implements MigrationInterface {
    name = 'addedGroupsToVoting1660633126451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" ADD "voteId" integer`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "voteId"`);
    }

}
