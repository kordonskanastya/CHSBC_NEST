import {MigrationInterface, QueryRunner} from "typeorm";

export class createVoting21660473925720 implements MigrationInterface {
    name = 'createVoting21660473925720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ADD "startDate" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "voting" ADD "endDate" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "voteRequiredCoursesId" integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "voteNotRequiredCoursesId" integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d456c22061e86f1339e256f2d34" FOREIGN KEY ("voteRequiredCoursesId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d" FOREIGN KEY ("voteNotRequiredCoursesId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d456c22061e86f1339e256f2d34"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "voteNotRequiredCoursesId"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "voteRequiredCoursesId"`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "voting" DROP COLUMN "startDate"`);
    }

}
