import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1726690921007 implements MigrationInterface {
    name = 'Migrations1726690921007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "strava_credentials" ("id" SERIAL NOT NULL, "accessToken" character varying NOT NULL, "refreshToken" character varying NOT NULL, "tokenExpiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_0f783c19cd4e6f51a43d802f5a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "strava_athlete" ("id" SERIAL NOT NULL, "stravaId" bigint NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "profileUrl" character varying NOT NULL, "subscriptionId" integer, "userId" integer NOT NULL, "credentialsId" integer NOT NULL, CONSTRAINT "UQ_1ae365d2b3b555d260568c7166d" UNIQUE ("stravaId"), CONSTRAINT "REL_455b91de86a689ccb983b8b4bd" UNIQUE ("userId"), CONSTRAINT "REL_5f3175adf4c3cdf399917ee176" UNIQUE ("credentialsId"), CONSTRAINT "PK_325fd8a1e00bef41e624268ba2a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1ae365d2b3b555d260568c7166" ON "strava_athlete" ("stravaId") `);
        await queryRunner.query(`CREATE TABLE "strava_achievement_effort" ("stravaId" character varying NOT NULL, "effortName" character varying NOT NULL, "movingTime" integer NOT NULL, "elapsedTime" integer NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "activityStravaId" bigint NOT NULL, "athleteId" integer NOT NULL, CONSTRAINT "PK_3e536533afbb96b7d0e7b41794f" PRIMARY KEY ("stravaId"))`);
        await queryRunner.query(`CREATE TABLE "strava_activity" ("stravaId" bigint NOT NULL, "name" character varying NOT NULL, "sportType" character varying NOT NULL, "distance" integer NOT NULL, "movingTime" integer NOT NULL, "elapsedTime" integer NOT NULL, "totalElevationGain" integer NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "athleteId" integer NOT NULL, CONSTRAINT "PK_4af140def1449632f5c4a45827d" PRIMARY KEY ("stravaId"))`);
        await queryRunner.query(`CREATE TABLE "strava_segment" ("id" SERIAL NOT NULL, "stravaId" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_edcea7c14899736a6da21c34fdb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b67bfed2d0b5053c6a9210e8a1" ON "strava_segment" ("stravaId") `);
        await queryRunner.query(`CREATE TABLE "strava_segment_effort" ("stravaId" character varying NOT NULL, "movingTime" integer NOT NULL, "elapsedTime" integer NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "segmentId" integer NOT NULL, "activityStravaId" bigint NOT NULL, "athleteId" integer NOT NULL, CONSTRAINT "PK_1ee40ce3f72c2e6bdffc0866f9d" PRIMARY KEY ("stravaId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e289d90dd36a66d2f96950af51" ON "strava_segment_effort" ("segmentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fd4a5507a7ed910d2eff24786f" ON "strava_segment_effort" ("activityStravaId") `);
        await queryRunner.query(`CREATE TABLE "strava_backfill_status" ("id" SERIAL NOT NULL, "progress" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "athleteId" integer NOT NULL, CONSTRAINT "PK_e9b191868fc0c551cee6c937914" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "achievement" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "activityStravaId" bigint NOT NULL, "athleteId" integer NOT NULL, CONSTRAINT "PK_441339f40e8ce717525a381671e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_401ec38d9728d6a60c8a845ffa" ON "achievement" ("activityStravaId") `);
        await queryRunner.query(`ALTER TABLE "strava_athlete" ADD CONSTRAINT "FK_455b91de86a689ccb983b8b4bd3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "strava_athlete" ADD CONSTRAINT "FK_5f3175adf4c3cdf399917ee176e" FOREIGN KEY ("credentialsId") REFERENCES "strava_credentials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "strava_achievement_effort" ADD CONSTRAINT "FK_48db9e38284afcce3418f79beb1" FOREIGN KEY ("activityStravaId") REFERENCES "strava_activity"("stravaId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "strava_achievement_effort" ADD CONSTRAINT "FK_b81ecd7eab9a7d0bd814eef7cdf" FOREIGN KEY ("athleteId") REFERENCES "strava_athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "strava_activity" ADD CONSTRAINT "FK_040807446e241dab3e55c9d1420" FOREIGN KEY ("athleteId") REFERENCES "strava_athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "strava_segment_effort" ADD CONSTRAINT "FK_e289d90dd36a66d2f96950af517" FOREIGN KEY ("segmentId") REFERENCES "strava_segment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "strava_segment_effort" ADD CONSTRAINT "FK_fd4a5507a7ed910d2eff24786fa" FOREIGN KEY ("activityStravaId") REFERENCES "strava_activity"("stravaId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "strava_segment_effort" ADD CONSTRAINT "FK_b41829ebbe9fb2fd541de2a8a80" FOREIGN KEY ("athleteId") REFERENCES "strava_athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "strava_backfill_status" ADD CONSTRAINT "FK_10c4b5e7a0a761d0078b6dee228" FOREIGN KEY ("athleteId") REFERENCES "strava_athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "achievement" ADD CONSTRAINT "FK_401ec38d9728d6a60c8a845ffa9" FOREIGN KEY ("activityStravaId") REFERENCES "strava_activity"("stravaId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "achievement" ADD CONSTRAINT "FK_b082e86dd3c31eb8412ce805c13" FOREIGN KEY ("athleteId") REFERENCES "strava_athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "achievement" DROP CONSTRAINT "FK_b082e86dd3c31eb8412ce805c13"`);
        await queryRunner.query(`ALTER TABLE "achievement" DROP CONSTRAINT "FK_401ec38d9728d6a60c8a845ffa9"`);
        await queryRunner.query(`ALTER TABLE "strava_backfill_status" DROP CONSTRAINT "FK_10c4b5e7a0a761d0078b6dee228"`);
        await queryRunner.query(`ALTER TABLE "strava_segment_effort" DROP CONSTRAINT "FK_b41829ebbe9fb2fd541de2a8a80"`);
        await queryRunner.query(`ALTER TABLE "strava_segment_effort" DROP CONSTRAINT "FK_fd4a5507a7ed910d2eff24786fa"`);
        await queryRunner.query(`ALTER TABLE "strava_segment_effort" DROP CONSTRAINT "FK_e289d90dd36a66d2f96950af517"`);
        await queryRunner.query(`ALTER TABLE "strava_activity" DROP CONSTRAINT "FK_040807446e241dab3e55c9d1420"`);
        await queryRunner.query(`ALTER TABLE "strava_achievement_effort" DROP CONSTRAINT "FK_b81ecd7eab9a7d0bd814eef7cdf"`);
        await queryRunner.query(`ALTER TABLE "strava_achievement_effort" DROP CONSTRAINT "FK_48db9e38284afcce3418f79beb1"`);
        await queryRunner.query(`ALTER TABLE "strava_athlete" DROP CONSTRAINT "FK_5f3175adf4c3cdf399917ee176e"`);
        await queryRunner.query(`ALTER TABLE "strava_athlete" DROP CONSTRAINT "FK_455b91de86a689ccb983b8b4bd3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_401ec38d9728d6a60c8a845ffa"`);
        await queryRunner.query(`DROP TABLE "achievement"`);
        await queryRunner.query(`DROP TABLE "strava_backfill_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd4a5507a7ed910d2eff24786f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e289d90dd36a66d2f96950af51"`);
        await queryRunner.query(`DROP TABLE "strava_segment_effort"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b67bfed2d0b5053c6a9210e8a1"`);
        await queryRunner.query(`DROP TABLE "strava_segment"`);
        await queryRunner.query(`DROP TABLE "strava_activity"`);
        await queryRunner.query(`DROP TABLE "strava_achievement_effort"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1ae365d2b3b555d260568c7166"`);
        await queryRunner.query(`DROP TABLE "strava_athlete"`);
        await queryRunner.query(`DROP TABLE "strava_credentials"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
