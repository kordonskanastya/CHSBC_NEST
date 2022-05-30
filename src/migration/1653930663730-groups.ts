import {MigrationInterface, QueryRunner} from "typeorm";

export class groups1653930663730 implements MigrationInterface {
    name = 'groups1653930663730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_586bdb4687e22b93b708e3c670d"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "UQ_586bdb4687e22b93b708e3c670d"`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_586bdb4687e22b93b708e3c670d" FOREIGN KEY ("curatorIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_586bdb4687e22b93b708e3c670d"`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "UQ_586bdb4687e22b93b708e3c670d" UNIQUE ("curatorIdId")`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_586bdb4687e22b93b708e3c670d" FOREIGN KEY ("curatorIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
