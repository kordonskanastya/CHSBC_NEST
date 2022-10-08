import {MigrationInterface, QueryRunner} from "typeorm";

export class fixDeleteCourse1665229412303 implements MigrationInterface {
    name = 'fixDeleteCourse1665229412303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_ae6c4263699ebf4bc4a79e4578b"`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_ae6c4263699ebf4bc4a79e4578b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting-result" DROP CONSTRAINT "FK_ae6c4263699ebf4bc4a79e4578b"`);
        await queryRunner.query(`ALTER TABLE "voting-result" ADD CONSTRAINT "FK_ae6c4263699ebf4bc4a79e4578b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
