import {MigrationInterface, QueryRunner} from "typeorm";

export class deletedTableCourseToVotingResult1665442059160 implements MigrationInterface {
    name = 'deletedTableCourseToVotingResult1665442059160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" DROP COLUMN "tableCourse"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" ADD "tableCourse" integer`);
    }

}
