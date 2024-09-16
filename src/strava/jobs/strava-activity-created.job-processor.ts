import { StravaService } from '../strava.service';
import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import { STRAVA_ACTIVITY_CREATED_JOB, StravaActivityCreatedJob } from './jobs';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { Logger } from '@nestjs/common';
import { StravaActivity } from '../entities/strava-activity.entity';
import { StravaSegmentEffort } from '../entities/strava-segment-effort.entity';
import { StravaSegment } from '../entities/strava-segment.entity';
import { StravaAchievementEffort } from '../entities/strava-achievement-effort.entity';
import { StravaApiActivity } from '../strava-api.service';
import { TransactionRunner } from '../transaction-runner.provider';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import {
  createStravaActivityRecord,
  createStravaSAchievementEffortRecord,
  createStravaSegmentEffortRecord,
} from '../entities/entity-factory';

@JobProcessor(STRAVA_ACTIVITY_CREATED_JOB)
export class StravaActivityCreatedJobProcessor
  implements QueuedJobProcessor<StravaActivityCreatedJob>
{
  private readonly logger = new Logger(StravaActivityCreatedJobProcessor.name);

  constructor(
    private stravaService: StravaService,
    private transactionRunner: TransactionRunner,
  ) {}

  async processJob(job: StravaActivityCreatedJob): Promise<void> {
    const activity = await this.stravaService.fetchActivity(
      job.stravaActivityId,
      job.stravaAthleteId,
    );
    this.logger.debug(`Found activity on Strava ${activity.id}`);
    await this.storeActivity(activity, job.stravaAthleteId);
    await this.stravaService.setDescription(
      job.stravaAthleteId,
      job.stravaActivityId,
      '🤖 bipbopbop - rekordbot.com is analyzing efforts',
    );
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
      const stravaActivity = createStravaActivityRecord(activity, athlete);
      await manager.save(StravaActivity, stravaActivity);

      this.logger.debug(`Saving segment efforts for athlete ${athlete.id}`);
      for (const activitySegmentEffort of activity.segment_efforts) {
        const segment = await this.getOrCreateSegment(
          manager,
          activitySegmentEffort.segment,
        );
        this.logger.debug(`Creating segment efforts on segment ${segment.id}`);
        const segmentEffort = createStravaSegmentEffortRecord(
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
          const achievementEffort = await createStravaSAchievementEffortRecord(
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

  private async getOrCreateSegment(
    manager: EntityManager,
    segment: any,
  ): Promise<StravaSegment> {
    const segmentRecord = await manager.findOne(StravaSegment, {
      where: { stravaId: segment.id },
    });
    if (segmentRecord) {
      return segmentRecord;
    }
    return await this.createSegmentRecord(manager, segment);
  }

  private async createSegmentRecord(
    manager: EntityManager,
    segment: any,
  ): Promise<StravaSegment> {
    const newSegment = new StravaSegment();
    newSegment.stravaId = segment.id;
    newSegment.name = segment.name;
    await manager.save(newSegment);
    return newSegment;
  }
}
