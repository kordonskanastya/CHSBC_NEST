import {MigrationInterface, QueryRunner} from "typeorm";

export class fixGrades1661530844321 implements MigrationInterface {
    name = 'fixGrades1661530844321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d456c22061e86f1339e256f2d34"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc"`);
        await queryRunner.query(`CREATE TABLE "students_votes_voting" ("studentsId" integer NOT NULL, "votingId" integer NOT NULL, CONSTRAINT "PK_4f9e975ff755d2e7b9692a6f857" PRIMARY KEY ("studentsId", "votingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_216026004b1923e6e967f7a309" ON "students_votes_voting" ("studentsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_966f9f33d94c4f03b06a4f7957" ON "students_votes_voting" ("votingId") `);
        await queryRunner.query(`CREATE TABLE "courses_students_students" ("coursesId" integer NOT NULL, "studentsId" integer NOT NULL, CONSTRAINT "PK_cd841c434866a6504aec6bca47c" PRIMARY KEY ("coursesId", "studentsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dffd4341c3ac7907af894f52e1" ON "courses_students_students" ("coursesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6240c191ac91418ffb0891e94c" ON "courses_students_students" ("studentsId") `);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "voteId"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "studentId"`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "UQ_ff09424ef05361e1c47fa03d82b" UNIQUE ("courseId")`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d456c22061e86f1339e256f2d34" FOREIGN KEY ("voteRequiredCoursesId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d" FOREIGN KEY ("voteNotRequiredCoursesId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students_votes_voting" ADD CONSTRAINT "FK_216026004b1923e6e967f7a3092" FOREIGN KEY ("studentsId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students_votes_voting" ADD CONSTRAINT "FK_966f9f33d94c4f03b06a4f79571" FOREIGN KEY ("votingId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" ADD CONSTRAINT "FK_dffd4341c3ac7907af894f52e16" FOREIGN KEY ("coursesId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" ADD CONSTRAINT "FK_6240c191ac91418ffb0891e94c5" FOREIGN KEY ("studentsId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_students_students" DROP CONSTRAINT "FK_6240c191ac91418ffb0891e94c5"`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" DROP CONSTRAINT "FK_dffd4341c3ac7907af894f52e16"`);
        await queryRunner.query(`ALTER TABLE "students_votes_voting" DROP CONSTRAINT "FK_966f9f33d94c4f03b06a4f79571"`);
        await queryRunner.query(`ALTER TABLE "students_votes_voting" DROP CONSTRAINT "FK_216026004b1923e6e967f7a3092"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d456c22061e86f1339e256f2d34"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "UQ_ff09424ef05361e1c47fa03d82b"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "studentId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD "voteId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6240c191ac91418ffb0891e94c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dffd4341c3ac7907af894f52e1"`);
        await queryRunner.query(`DROP TABLE "courses_students_students"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_966f9f33d94c4f03b06a4f7957"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_216026004b1923e6e967f7a309"`);
        await queryRunner.query(`DROP TABLE "students_votes_voting"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d" FOREIGN KEY ("voteNotRequiredCoursesId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d456c22061e86f1339e256f2d34" FOREIGN KEY ("voteRequiredCoursesId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_6d8620a3b447dc4f2c1a08e0a92" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
