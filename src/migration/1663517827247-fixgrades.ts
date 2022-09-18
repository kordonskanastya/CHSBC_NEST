import {MigrationInterface, QueryRunner} from "typeorm";

export class fixgrades1663517827247 implements MigrationInterface {
    name = 'fixgrades1663517827247'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" ALTER COLUMN "grade" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grades" ALTER COLUMN "grade" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grades" ALTER COLUMN "grade" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grades" ALTER COLUMN "grade" SET NOT NULL`);
    }

}
