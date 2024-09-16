import { Module } from '@nestjs/common';
import { StravaAuthController } from './controllers/strava-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaAthlete } from './entities/strava-athlete.entity';
import { StravaCredentials } from './entities/strava-credentials.entity';
import { StravaService } from './strava.service';
import { StravaApiService } from './strava-api.service';
import { UserModule } from '../user/user.module';
import { StravaWebhookController } from './controllers/strava-webhook.controller';
import { StravaAchievementEffort } from './entities/strava-achievement-effort.entity';
import { StravaActivity } from './entities/strava-activity.entity';
import { StravaSegmentEffort } from './entities/strava-segment-effort.entity';
import { StravaSegment } from './entities/strava-segment.entity';
import { StravaActivityCreatedJobProcessor } from './jobs/strava-activity-created.job-processor';
import { StravaBackfillJobProcessor } from './jobs/strava-backfill.job-processor';
import { StravaAthleteAddedJobProcessor } from './jobs/strava-athlete-added-job.processor';
import { StravaActivityDeletedJobProcessor } from './jobs/strava-activity-deleted.job-processor';
import { ConfigModule } from '@nestjs/config';
import { TransactionRunner } from './transaction-runner.provider';
import { StravaActivityUpdatedJobProcessor } from './jobs/strava-activity-updated.job-processor';
import { StravaBackfillStatus } from './entities/strava-backfill-status.entity';
import { BackfillScheduler } from './jobs/backfill-scheduler';
import { TestLabController } from './controllers/test-lab.controller';
import { ActivityEffortsCreationService } from './jobs/activity-efforts-cretation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StravaAthlete,
      StravaAchievementEffort,
      StravaActivity,
      StravaBackfillStatus,
      StravaCredentials,
      StravaSegment,
      StravaSegmentEffort,
    ]),
    UserModule,
    ConfigModule,
  ],
  controllers: [
    StravaAuthController,
    StravaWebhookController,
    TestLabController,
  ],
  providers: [
    StravaService,
    StravaApiService,
    StravaActivityCreatedJobProcessor,
    StravaActivityDeletedJobProcessor,
    StravaActivityUpdatedJobProcessor,
    StravaBackfillJobProcessor,
    StravaAthleteAddedJobProcessor,
    TransactionRunner,
    BackfillScheduler,
    ActivityEffortsCreationService,
  ],
  exports: [StravaService],
})
export class StravaModule {}
