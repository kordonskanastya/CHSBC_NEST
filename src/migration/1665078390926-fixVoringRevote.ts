import {MigrationInterface, QueryRunner} from "typeorm";

export class fixVoringRevote1665078390926 implements MigrationInterface {
    name = 'fixVoringRevote1665078390926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ALTER COLUMN "isRevote" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "voting" ALTER COLUMN "isRevote" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voting" ALTER COLUMN "isRevote" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "voting" ALTER COLUMN "isRevote" DROP NOT NULL`);
    }

}
