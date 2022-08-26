import {MigrationInterface, QueryRunner} from "typeorm";

export class fixRelationsWithEntities1661528096583 implements MigrationInterface {
    name = 'fixRelationsWithEntities1661528096583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d456c22061e86f1339e256f2d34"`);
        await queryRunner.query(`ALTER TABLE "students_votes_voting" DROP CONSTRAINT "FK_216026004b1923e6e967f7a3092"`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" DROP CONSTRAINT "FK_dffd4341c3ac7907af894f52e16"`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d456c22061e86f1339e256f2d34" FOREIGN KEY ("voteRequiredCoursesId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d" FOREIGN KEY ("voteNotRequiredCoursesId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students_votes_voting" ADD CONSTRAINT "FK_216026004b1923e6e967f7a3092" FOREIGN KEY ("studentsId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" ADD CONSTRAINT "FK_dffd4341c3ac7907af894f52e16" FOREIGN KEY ("coursesId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_students_students" DROP CONSTRAINT "FK_dffd4341c3ac7907af894f52e16"`);
        await queryRunner.query(`ALTER TABLE "students_votes_voting" DROP CONSTRAINT "FK_216026004b1923e6e967f7a3092"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d456c22061e86f1339e256f2d34"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b"`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" ADD CONSTRAINT "FK_dffd4341c3ac7907af894f52e16" FOREIGN KEY ("coursesId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students_votes_voting" ADD CONSTRAINT "FK_216026004b1923e6e967f7a3092" FOREIGN KEY ("studentsId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d456c22061e86f1339e256f2d34" FOREIGN KEY ("voteRequiredCoursesId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4c15ba07f47bb96db79f91c2d7d" FOREIGN KEY ("voteNotRequiredCoursesId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_ff09424ef05361e1c47fa03d82b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
