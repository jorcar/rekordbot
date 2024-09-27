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
import { TransactionRunner } from '../common/transaction-runner.provider';
import { StravaActivityUpdatedJobProcessor } from './jobs/strava-activity-updated.job-processor';
import { StravaBackfillStatus } from './entities/strava-backfill-status.entity';
import { ThrottledScheduler } from './jobs/throttled-scheduler.service';
import { TestLabController } from './controllers/test-lab.controller';
import { ActivityEffortsCreationService } from './jobs/activity-efforts-creation.service';
import { AthleteStatisticsService } from './athlete-statistics.service';
import { StravaActivityAnalysisJobProcessor } from './jobs/strava-activity-analysis.job-processor';
import { ActivityAnalyzer } from './activity-analysis/activity-analyzer';
import { ActivityAchievementsAnalyzer } from './activity-analysis/grouped-analyzers/activity-achievements-analyzer';
import { SegmentEffortsAnalyzer } from './activity-analysis/grouped-analyzers/segment-efforts-analyzer';
import { AchievementEffortsAnalyzer } from './activity-analysis/grouped-analyzers/achievement-efforts-analyzer';
import { Achievement } from './entities/achievement.entity';
import { StravaCredentialsRepository } from './repositories/strava-credentials.repository';
import { StravaAthleteRepository } from './repositories/strava-athlete.repository';
import { StravaActivityRepository } from './repositories/strava-activity.repository';
import { StravaSegmentRepository } from './repositories/strava-segment.repository';
import { StravaSegmentEffortRepository } from './repositories/strava-segment-effort.repository';
import { StravaAchievementEffortRepository } from './repositories/strava-achievement-effort.repository';
import { AchievementRepository } from './repositories/achievement.repository';
import { BackfillStatusRepository } from './repositories/backfill-status.repository';
import { Backfiller } from './backfill/backfiller';
import { ActivityBackfiller } from './backfill/activity-backfiller';
import { EffortBackfiller } from './backfill/effort-backfiller';

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
    ActivityAnalyzer,
    StravaService,
    StravaApiService,
    StravaActivityCreatedJobProcessor,
    StravaActivityDeletedJobProcessor,
    StravaActivityUpdatedJobProcessor,
    StravaBackfillJobProcessor,
    StravaAthleteAddedJobProcessor,
    StravaActivityAnalysisJobProcessor,
    TransactionRunner,
    ThrottledScheduler,
    ActivityEffortsCreationService,
    AthleteStatisticsService,
    ActivityAchievementsAnalyzer,
    SegmentEffortsAnalyzer,
    AchievementEffortsAnalyzer,
    StravaCredentialsRepository,
    StravaAthleteRepository,
    StravaActivityRepository,
    StravaSegmentRepository,
    StravaSegmentEffortRepository,
    StravaAchievementEffortRepository,
    AchievementRepository,
    BackfillStatusRepository,
    Backfiller,
    ActivityBackfiller,
    EffortBackfiller,
  ],
  exports: [StravaService, AthleteStatisticsService],
})
export class StravaModule {}
