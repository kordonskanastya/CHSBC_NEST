import {MigrationInterface, QueryRunner} from "typeorm";

export class fixDeleteStudent1665216489627 implements MigrationInterface {
    name = 'fixDeleteStudent1665216489627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "studentId" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_42dc3c1fa59ce4a36a19cff2721" UNIQUE ("studentId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_42dc3c1fa59ce4a36a19cff2721" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_42dc3c1fa59ce4a36a19cff2721"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_42dc3c1fa59ce4a36a19cff2721"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "studentId"`);
    }

}
