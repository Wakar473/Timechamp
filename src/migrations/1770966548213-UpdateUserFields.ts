import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserFields1770966548213 implements MigrationInterface {
    name = 'UpdateUserFields1770966548213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns (nullable first)
        await queryRunner.query(`ALTER TABLE "users" ADD "first_name" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_name" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "employee_id" character varying(50)`);

        // Migrate existing data: split name into first_name and last_name, generate employee_id
        await queryRunner.query(`
            WITH numbered_users AS (
                SELECT 
                    id,
                    COALESCE(SPLIT_PART(name, ' ', 1), '') as new_first_name,
                    COALESCE(NULLIF(SUBSTRING(name FROM POSITION(' ' IN name) + 1), ''), '') as new_last_name,
                    CONCAT('EMP', LPAD(CAST(ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY created_at) AS TEXT), 4, '0')) as new_employee_id
                FROM users
            )
            UPDATE users
            SET 
                first_name = numbered_users.new_first_name,
                last_name = numbered_users.new_last_name,
                employee_id = numbered_users.new_employee_id
            FROM numbered_users
            WHERE users.id = numbered_users.id
        `);

        // Make columns NOT NULL now that data is migrated
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "employee_id" SET NOT NULL`);

        // Create unique index on employee_id
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_519d7acd12faf93fc93d09f14a" ON "users" ("organization_id", "employee_id") `);

        // Drop old name column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_519d7acd12faf93fc93d09f14a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "employee_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying(255) NOT NULL`);
    }

}
