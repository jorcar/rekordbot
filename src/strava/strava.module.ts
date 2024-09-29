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
import { StravaAthleteAddedJobProcessor } from './jobs/strava-athlete-added-job.processor';
import { StravaActivityDeletedJobProcessor } from './jobs/strava-activity-deleted.job-processor';
import { ConfigModule } from '@nestjs/config';
import { TransactionRunner } from '../common/transaction-runner.provider';
import { StravaActivityUpdatedJobProcessor } from './jobs/strava-activity-updated.job-processor';
import { StravaBackfillStatus } from '../strava-backfill/strava-backfill-status.entity';
import { ThrottledScheduler } from './jobs/throttled-scheduler.service';
import { TestLabController } from './controllers/test-lab.controller';
import { ActivityEffortsCreationService } from './activity-efforts-creation.service';
import { AthleteStatisticsService } from './athlete-statistics.service';
import { Achievement } from '../strava-analysis/achievement.entity';
import { StravaCredentialsRepository } from './repositories/strava-credentials.repository';
import { StravaAthleteRepository } from './repositories/strava-athlete.repository';
import { StravaActivityRepository } from './repositories/strava-activity.repository';
import { StravaSegmentRepository } from './repositories/strava-segment.repository';
import { StravaSegmentEffortRepository } from './repositories/strava-segment-effort.repository';
import { StravaAchievementEffortRepository } from './repositories/strava-achievement-effort.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Achievement,
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
    StravaAthleteAddedJobProcessor,
    TransactionRunner,
    ThrottledScheduler,
    ActivityEffortsCreationService,
    AthleteStatisticsService,
    StravaCredentialsRepository,
    StravaAthleteRepository,
    StravaActivityRepository,
    StravaSegmentRepository,
    StravaSegmentEffortRepository,
    StravaAchievementEffortRepository,
  ],
  exports: [
    StravaService,
    AthleteStatisticsService,
    StravaActivityRepository,
    StravaSegmentEffortRepository,
    StravaAchievementEffortRepository,
    ActivityEffortsCreationService,
    StravaAthleteRepository,
  ],
})
export class StravaModule {}
