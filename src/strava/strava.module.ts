import { Module } from '@nestjs/common';
import { StravaAuthController } from './strava-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaCredentials } from './strava-credentials.entity';
import { StravaService } from './strava.service';
import { StravaApiService } from './strava-api.service';
import { UserModule } from '../user/user.module';
import { StravaWebhookController } from './strava-webhook.controller';
import { StravaAchievementEffort } from './strava-achievement-effort.entity';
import { StravaActivity } from './strava-activity.entity';
import { StravaSegmentEffort } from './strava-segment-effort.entity';
import { StravaSegment } from './strava-segment.entity';
import { StravaActivityCreatedJobProcessor } from './strava-activity-created.job-processor';
import { StravaBackfillJobProcessor } from './strava-backfill.job-processor';
import { StravaAthleteAddedJobProcessor } from './strava-athlete-added-job.processor';
import { StravaActivityDeletedJobProcessor } from './strava-activity-deleted.job-processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StravaAthlete,
      StravaAchievementEffort,
      StravaActivity,
      StravaCredentials,
      StravaSegment,
      StravaSegmentEffort,
    ]),
    UserModule,
  ],
  controllers: [StravaAuthController, StravaWebhookController],
  providers: [
    StravaService,
    StravaApiService,
    StravaActivityCreatedJobProcessor,
    StravaActivityDeletedJobProcessor,
    StravaBackfillJobProcessor,
    StravaAthleteAddedJobProcessor,
  ],
  exports: [StravaService],
})
export class StravaModule {}
