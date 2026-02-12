import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1707000000000 implements MigrationInterface {
    name = 'InitialSchema1707000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create organizations table
        await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "plan_type" varchar(50) NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

        // Create users table
        await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('admin', 'manager', 'employee')
    `);

        await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM('active', 'inactive', 'suspended')
    `);

        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'employee',
        "status" "user_status_enum" NOT NULL DEFAULT 'active',
        "last_seen" timestamp NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_users_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_users_org_email" UNIQUE ("organization_id", "email")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_users_org_email" ON "users" ("organization_id", "email")
    `);

        // Create projects table
        await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text NULL,
        "created_by" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_projects_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_projects_creator" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

        // Create work_sessions table
        await queryRunner.query(`
      CREATE TYPE "session_status_enum" AS ENUM('active', 'stopped')
    `);

        await queryRunner.query(`
      CREATE TABLE "work_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "project_id" uuid NULL,
        "start_time" timestamp NOT NULL,
        "end_time" timestamp NULL,
        "total_active_seconds" int NOT NULL DEFAULT 0,
        "total_idle_seconds" int NOT NULL DEFAULT 0,
        "status" "session_status_enum" NOT NULL DEFAULT 'active',
        "last_activity_at" timestamp NOT NULL DEFAULT now(),
        "version" int NOT NULL DEFAULT 1,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_sessions_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_sessions_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_sessions_user_status" ON "work_sessions" ("user_id", "status")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_sessions_last_activity" ON "work_sessions" ("last_activity_at")
    `);

        // Create activity_logs table
        await queryRunner.query(`
      CREATE TYPE "activity_type_enum" AS ENUM('active', 'idle')
    `);

        await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "session_id" uuid NOT NULL,
        "timestamp" timestamp NOT NULL,
        "activity_type" "activity_type_enum" NOT NULL,
        "duration_seconds" int NOT NULL,
        "app_name" varchar(255) NULL,
        "url" text NULL,
        CONSTRAINT "fk_activity_logs_session" FOREIGN KEY ("session_id") REFERENCES "work_sessions"("id") ON DELETE CASCADE
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_activity_logs_session_timestamp" ON "activity_logs" ("session_id", "timestamp")
    `);

        // Create daily_summaries table
        await queryRunner.query(`
      CREATE TABLE "daily_summaries" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "date" date NOT NULL,
        "total_work_seconds" int NOT NULL DEFAULT 0,
        "active_seconds" int NOT NULL DEFAULT 0,
        "idle_seconds" int NOT NULL DEFAULT 0,
        "productivity_score" decimal(5,2) NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_summaries_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_summaries_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_summaries_user_date" UNIQUE ("user_id", "date")
      )
    `);

        // Create alerts table
        await queryRunner.query(`
      CREATE TYPE "alert_type_enum" AS ENUM('idle', 'overtime')
    `);

        await queryRunner.query(`
      CREATE TABLE "alerts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "type" "alert_type_enum" NOT NULL,
        "message" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "resolved_at" timestamp NULL,
        CONSTRAINT "fk_alerts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP TYPE "alert_type_enum"`);
        await queryRunner.query(`DROP TABLE "daily_summaries"`);
        await queryRunner.query(`DROP TABLE "activity_logs"`);
        await queryRunner.query(`DROP TYPE "activity_type_enum"`);
        await queryRunner.query(`DROP TABLE "work_sessions"`);
        await queryRunner.query(`DROP TYPE "session_status_enum"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "user_status_enum"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
    }
}
