import {MigrationInterface, QueryRunner} from "typeorm";

export class fixRelations1661164464112 implements MigrationInterface {
    name = 'fixRelations1661164464112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_d657bbfbcafe6e7ab90555de4bc" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
