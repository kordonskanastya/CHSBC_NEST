import {MigrationInterface, QueryRunner} from "typeorm";

export class fix1654095038754 implements MigrationInterface {
    name = 'fix1654095038754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc65c917a3b4f2d8230c948067c"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_69f856a42188e4445f34986ce75"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_586bdb4687e22b93b708e3c670d"`);
        await queryRunner.query(`ALTER TABLE "groups" RENAME COLUMN "curatorIdId" TO "curatorId"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "REL_cc65c917a3b4f2d8230c948067"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "userIdId"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "groupIdId"`);
        await queryRunner.query(`ALTER TABLE "students" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "students" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "students" ADD "groupId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "UQ_e0208b4f964e609959aff431bf9" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18" FOREIGN KEY ("curatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_e805347954b6a54c7d3a8ea2a18"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_cc296de36cadf8de53b9cd60aa7"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "UQ_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "groupId"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "created"`);
        await queryRunner.query(`ALTER TABLE "students" ADD "groupIdId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD "userIdId" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "REL_cc65c917a3b4f2d8230c948067" UNIQUE ("userIdId")`);
        await queryRunner.query(`ALTER TABLE "groups" RENAME COLUMN "curatorId" TO "curatorIdId"`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_586bdb4687e22b93b708e3c670d" FOREIGN KEY ("curatorIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_69f856a42188e4445f34986ce75" FOREIGN KEY ("groupIdId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_cc65c917a3b4f2d8230c948067c" FOREIGN KEY ("userIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
