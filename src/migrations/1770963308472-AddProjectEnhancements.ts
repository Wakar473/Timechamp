import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProjectEnhancements1770963308472 implements MigrationInterface {
    name = 'AddProjectEnhancements1770963308472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "project_id" uuid NOT NULL, "assigned_by" uuid NOT NULL, "assigned_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "projectId" uuid, "assignerId" uuid, CONSTRAINT "PK_045df8f32ae1d54810b39b9c7bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_55de07519449f4031e4a3a8971" ON "project_assignments" ("project_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_888c09764dd8b08e8736508303" ON "project_assignments" ("user_id", "project_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "manager_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD "managerId" uuid`);
        await queryRunner.query(`CREATE TYPE "public"."projects_project_type_enum" AS ENUM('normal', 'system')`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "project_type" "public"."projects_project_type_enum" NOT NULL DEFAULT 'normal'`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "archived_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD "organization_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD "session_id" uuid`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD "resolved_by" uuid`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD "organizationId" uuid`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD "sessionId" uuid`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD "resolverId" uuid`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD "screenshot_timestamp" TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX "IDX_fba2d8e029689aa8fea98e53c9" ON "users" ("manager_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_63d433323a2327e780a143d45e" ON "alerts" ("user_id", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_75143eb7ee368c3d36631f02f9" ON "alerts" ("organization_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_874662e039ab7d31a71450eb501" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_assignments" ADD CONSTRAINT "FK_2de237ae3bf6566e76fa428199b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_assignments" ADD CONSTRAINT "FK_9c5f0cbd89c4d1e858a4b4a4e4f" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_assignments" ADD CONSTRAINT "FK_32100af451df0e8e6f41688c4c6" FOREIGN KEY ("assignerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_5259a93699bf6b47307fbb2f04e" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_54c964bc04ab4ee2667621f19e2" FOREIGN KEY ("sessionId") REFERENCES "work_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_6fb2845a269a762c9e2a646d1e5" FOREIGN KEY ("resolverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_6fb2845a269a762c9e2a646d1e5"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_54c964bc04ab4ee2667621f19e2"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_5259a93699bf6b47307fbb2f04e"`);
        await queryRunner.query(`ALTER TABLE "project_assignments" DROP CONSTRAINT "FK_32100af451df0e8e6f41688c4c6"`);
        await queryRunner.query(`ALTER TABLE "project_assignments" DROP CONSTRAINT "FK_9c5f0cbd89c4d1e858a4b4a4e4f"`);
        await queryRunner.query(`ALTER TABLE "project_assignments" DROP CONSTRAINT "FK_2de237ae3bf6566e76fa428199b"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_874662e039ab7d31a71450eb501"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75143eb7ee368c3d36631f02f9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_63d433323a2327e780a143d45e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fba2d8e029689aa8fea98e53c9"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "screenshot_timestamp"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "resolverId"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "sessionId"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "resolved_by"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "session_id"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "organization_id"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "archived_at"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "project_type"`);
        await queryRunner.query(`DROP TYPE "public"."projects_project_type_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "managerId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "manager_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_888c09764dd8b08e8736508303"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55de07519449f4031e4a3a8971"`);
        await queryRunner.query(`DROP TABLE "project_assignments"`);
    }

}
