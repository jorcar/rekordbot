import { StravaService } from './strava.service';
import { JobProcessor, QueuedJobProcessor } from '../job/job-processor';
import { STRAVA_ACTIVITY_CREATED_JOB, StravaActivityCreatedJob } from './jobs';
import { StravaAthlete } from './strava-athlete.entity';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { StravaActivity } from './strava-activity.entity';
import { StravaSegmentEffort } from './strava-segment-effort.entity';
import { StravaSegment } from './strava-segment.entity';
import { StravaAchievementEffort } from './strava-achievement-effort.entity';
import { StravaApiActivity } from './strava-api.service';
import { TransactionRunner } from './transaction-runner.provider';

@JobProcessor(STRAVA_ACTIVITY_CREATED_JOB)
export class StravaActivityCreatedJobProcessor
  implements QueuedJobProcessor<StravaActivityCreatedJob>
{
  private readonly logger = new Logger(StravaActivityCreatedJobProcessor.name);

  constructor(
    private stravaService: StravaService,
    private dataSource: DataSource,
    private transactionRunner: TransactionRunner,
  ) {}

  async processJob(job: StravaActivityCreatedJob): Promise<void> {
    const activity = await this.stravaService.fetchActivity(
      job.stravaActivityId,
      job.stravaAthleteId,
    );
    this.logger.debug(`Found activity on Strava ${activity.id}`);
    await this.storeActivity(activity, job.stravaAthleteId);
    // publish something new to trigger analysis
  }

  private async storeActivity(
    activity: StravaApiActivity,
    stravaAthleteId: number,
  ) {
    await this.transactionRunner.runInTransaction(async (manager) => {
      const athlete = await manager.findOneOrFail(StravaAthlete, {
        where: { stravaId: stravaAthleteId },
      });

      this.logger.debug(`Saving activity for athlete ${athlete.id}`);
      const stravaActivity = this.createStravaActivityRecord(activity, athlete);
      await manager.save(StravaActivity, stravaActivity);

      this.logger.debug(`Saving segment efforts for athlete ${athlete.id}`);
      for (const activitySegmentEffort of activity.segment_efforts) {
        const segment = await this.getOrCreateSegment(
          activitySegmentEffort.segment,
        );
        this.logger.debug(`Creating segment efforts on segment ${segment.id}`);
        const segmentEffort = this.createStravaSegmentEffortRecord(
          activitySegmentEffort,
          segment,
          stravaActivity,
          athlete,
        );
        await manager.save(StravaSegmentEffort, segmentEffort);
      }

      if (activity.best_efforts) {
        this.logger.debug(`Creating best efforts ${athlete.id}`);
        for (const activityBestEffort of activity.best_efforts) {
          const achievementEffort =
            await this.createStravaSAchievementEffortRecord(
              activityBestEffort,
              stravaActivity,
              athlete,
            );
          this.logger.debug(`Storing best effort for athlete ${athlete.id}`);
          await manager.save(StravaAchievementEffort, achievementEffort);
        }
      }
    });
  }

  private createStravaActivityRecord(
    activity: any,
    athlete: StravaAthlete,
  ): StravaActivity {
    const activityRecord = new StravaActivity();
    activityRecord.stravaId = activity.id;
    activityRecord.athlete = Promise.resolve(athlete);
    activityRecord.name = activity.name;
    activityRecord.distance = activity.distance;
    activityRecord.movingTime = activity.moving_time;
    activityRecord.elapsedTime = activity.elapsed_time;
    activityRecord.totalElevationGain = activity.total_elevation_gain;
    activityRecord.sportType = activity.type;
    activityRecord.startDate = new Date(activity.start_date);
    return activityRecord;
  }

  private createStravaSegmentEffortRecord(
    stravaEegmentEffort: any,
    segment: StravaSegment,
    stravaActivity: StravaActivity,
    stravaAthlete: StravaAthlete,
  ) {
    const segmentEffort = new StravaSegmentEffort();
    segmentEffort.activity = Promise.resolve(stravaActivity);
    segmentEffort.segment = Promise.resolve(segment);
    segmentEffort.athlete = Promise.resolve(stravaAthlete);
    segmentEffort.elapsedTime = stravaEegmentEffort.elapsed_time;
    segmentEffort.movingTime = stravaEegmentEffort.moving_time;
    segmentEffort.startDate = new Date(stravaEegmentEffort.start_date);
    return segment;
  }

  private async getOrCreateSegment(segment: any): Promise<StravaSegment> {
    const segmentRecord = await this.dataSource.manager.findOne(StravaSegment, {
      where: { stravaId: segment.id },
    });
    if (segmentRecord) {
      return segmentRecord;
    }
    return await this.createSegmentRecord(segment);
  }

  private async createSegmentRecord(segment: any): Promise<StravaSegment> {
    const newSegment = new StravaSegment();
    newSegment.stravaId = segment.id;
    newSegment.name = segment.name;
    await this.dataSource.manager.save(newSegment);
    return newSegment;
  }

  private async createStravaSAchievementEffortRecord(
    activityBestEffort: any,
    stravaActivity: StravaActivity,
    athlete: StravaAthlete,
  ): Promise<StravaAchievementEffort> {
    const achievementEffort = new StravaAchievementEffort();
    achievementEffort.athlete = Promise.resolve(athlete);
    achievementEffort.activity = Promise.resolve(stravaActivity);
    achievementEffort.effortName = activityBestEffort.name;
    achievementEffort.elapsedTime = activityBestEffort.elapsed_time;
    achievementEffort.movingTime = activityBestEffort.moving_time;
    achievementEffort.startDate = new Date(activityBestEffort.start_date);
    return achievementEffort;
  }
}
