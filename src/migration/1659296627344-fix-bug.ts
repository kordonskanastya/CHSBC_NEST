import {MigrationInterface, QueryRunner} from "typeorm";

export class fixBug1659296627344 implements MigrationInterface {
    name = 'fixBug1659296627344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_f921bd9bb6d061b90d386fa3721"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_f921bd9bb6d061b90d386fa3721" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18" FOREIGN KEY ("curatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_f921bd9bb6d061b90d386fa3721"`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18" FOREIGN KEY ("curatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_f921bd9bb6d061b90d386fa3721" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
