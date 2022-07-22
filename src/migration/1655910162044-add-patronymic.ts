import {MigrationInterface, QueryRunner} from "typeorm";

export class addPatronymic1655910162044 implements MigrationInterface {
    name = 'addPatronymic1655910162044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "patronymic" character varying(200)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "patronymic"`);
    }

}
