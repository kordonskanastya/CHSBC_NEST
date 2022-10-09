import {MigrationInterface, QueryRunner} from "typeorm";

export class fixDeleteGroup1665313187915 implements MigrationInterface {
    name = 'fixDeleteGroup1665313187915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18"`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18" FOREIGN KEY ("curatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18"`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18" FOREIGN KEY ("curatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
