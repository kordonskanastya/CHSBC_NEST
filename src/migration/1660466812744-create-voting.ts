import {MigrationInterface, QueryRunner} from "typeorm";

export class createVoting1660466812744 implements MigrationInterface {
    name = 'createVoting1660466812744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "voting" ("id" SERIAL NOT NULL, CONSTRAINT "PK_2dff1e5c53fa2cc610bea30476c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "voting"`);
    }

}
