import {MigrationInterface, QueryRunner} from "typeorm";

export class addedVotingResult1661795447017 implements MigrationInterface {
    name = 'addedVotingResult1661795447017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d456c22061e86f1339e256f2d34"`);
        await queryRunner.query(`CREATE TABLE "voting-result" ("id" SERIAL NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "voteId" integer, "courseId" integer, "studentId" integer, CONSTRAINT "PK_f34f4ff9bcf11eaf721a62926ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses_vote_required_courses_voting" ("coursesId" integer NOT NULL, "votingId" integer NOT NULL, CONSTRAINT "PK_74901b946b8b863f9910e6a56d9" PRIMARY KEY ("coursesId", "votingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1b30a9e60c12dfaabb6a173ddd" ON "courses_vote_required_courses_voting" ("coursesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a2f004f1f4c24f17cb698c2a47" ON "courses_vote_required_courses_voting" ("votingId") `);
        await queryRunner.query(`CREATE TABLE "courses_vote_not_required_courses_voting" ("coursesId" integer NOT NULL, "votingId" integer NOT NULL, CONSTRAINT "PK_bc5e8fc318422323ee2884bd33b" PRIMARY KEY ("coursesId", "votingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6017fe9037d826e14e86d0162d" ON "courses_vote_not_required_courses_voting" ("coursesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9ba4cb8b4eb5a25b1c1b3ca944" ON "courses_vote_not_required_courses_voting" ("votingId") `);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "voteRequiredCoursesId"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "voteNotRequiredCoursesId"`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_85a196e793df873807f93797491" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_ae6c4263699ebf4bc4a79e4578b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_e46b81147c35d3f0ca96747531a" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses_vote_required_courses_voting" ADD CONSTRAINT "FK_1b30a9e60c12dfaabb6a173ddd4" FOREIGN KEY ("coursesId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_vote_required_courses_voting" ADD CONSTRAINT "FK_a2f004f1f4c24f17cb698c2a476" FOREIGN KEY ("votingId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_vote_not_required_courses_voting" ADD CONSTRAINT "FK_6017fe9037d826e14e86d0162d9" FOREIGN KEY ("coursesId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_vote_not_required_courses_voting" ADD CONSTRAINT "FK_9ba4cb8b4eb5a25b1c1b3ca9447" FOREIGN KEY ("votingId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_vote_not_required_courses_voting" DROP CONSTRAINT "FK_9ba4cb8b4eb5a25b1c1b3ca9447"`);
        await queryRunner.query(`ALTER TABLE "courses_vote_not_required_courses_voting" DROP CONSTRAINT "FK_6017fe9037d826e14e86d0162d9"`);
        await queryRunner.query(`ALTER TABLE "courses_vote_required_courses_voting" DROP CONSTRAINT "FK_a2f004f1f4c24f17cb698c2a476"`);
        await queryRunner.query(`ALTER TABLE "courses_vote_required_courses_voting" DROP CONSTRAINT "FK_1b30a9e60c12dfaabb6a173ddd4"`);
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_e46b81147c35d3f0ca96747531a"`);
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_ae6c4263699ebf4bc4a79e4578b"`);
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_85a196e793df873807f93797491"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "voteNotRequiredCoursesId" integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "voteRequiredCoursesId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ba4cb8b4eb5a25b1c1b3ca944"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6017fe9037d826e14e86d0162d"`);
        await queryRunner.query(`DROP TABLE "courses_vote_not_required_courses_voting"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a2f004f1f4c24f17cb698c2a47"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b30a9e60c12dfaabb6a173ddd"`);
        await queryRunner.query(`DROP TABLE "courses_vote_required_courses_voting"`);
        await queryRunner.query(`DROP TABLE "voting-result"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d456c22061e86f1339e256f2d34" FOREIGN KEY ("voteRequiredCoursesId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d" FOREIGN KEY ("voteNotRequiredCoursesId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
