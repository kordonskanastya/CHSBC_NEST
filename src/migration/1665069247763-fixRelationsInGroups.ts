import {MigrationInterface, QueryRunner} from "typeorm";

export class fixRelationsInGroups1665069247763 implements MigrationInterface {
    name = 'fixRelationsInGroups1665069247763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_e46b81147c35d3f0ca96747531a"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75"`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" DROP CONSTRAINT "FK_6240c191ac91418ffb0891e94c5"`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_e46b81147c35d3f0ca96747531a" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" ADD CONSTRAINT "FK_6240c191ac91418ffb0891e94c5" FOREIGN KEY ("studentsId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_students_students" DROP CONSTRAINT "FK_6240c191ac91418ffb0891e94c5"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7"`);
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_e46b81147c35d3f0ca96747531a"`);
        await queryRunner.query(`ALTER TABLE "courses_students_students" ADD CONSTRAINT "FK_6240c191ac91418ffb0891e94c5" FOREIGN KEY ("studentsId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_51cee3d0c9b68a43e8b38b89a75" FOREIGN KEY ("voteId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_e46b81147c35d3f0ca96747531a" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
