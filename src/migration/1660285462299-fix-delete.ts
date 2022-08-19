import {MigrationInterface, QueryRunner} from "typeorm";

export class fixDelete1660285462299 implements MigrationInterface {
    name = 'fixDelete1660285462299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loggers" DROP CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0"`);
        await queryRunner.query(`ALTER TABLE "loggers" ADD CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loggers" DROP CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0"`);
        await queryRunner.query(`ALTER TABLE "loggers" ADD CONSTRAINT "FK_116fa0216ec2e36c943ca2107f0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
