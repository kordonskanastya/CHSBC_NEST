import {MigrationInterface, QueryRunner} from "typeorm";

export class addedTableCourseToVotingResult1665425805622 implements MigrationInterface {
    name = 'addedTableCourseToVotingResult1665425805622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" ADD "tableCourse" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" DROP COLUMN "tableCourse"`);
    }

}
