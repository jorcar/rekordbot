import { StravaService } from '../strava.service';
import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import {
  STRAVA_ACTIVITY_ANALYSIS_JOB,
  STRAVA_ACTIVITY_CREATED_JOB,
  StravaActivityAnalysisJob,
  StravaActivityCreatedJob,
} from './jobs';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { Logger } from '@nestjs/common';
import { StravaActivity } from '../entities/strava-activity.entity';
import { StravaApiActivity } from '../strava-api.service';
import { TransactionRunner } from '../transaction-runner.provider';
import { createStravaActivityRecord } from '../entities/entity-factory';
import { ActivityEffortsCreationService } from './activity-efforts-cretation.service';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';

@JobProcessor(STRAVA_ACTIVITY_CREATED_JOB)
export class StravaActivityCreatedJobProcessor
  implements QueuedJobProcessor<StravaActivityCreatedJob>
{
  private readonly logger = new Logger(StravaActivityCreatedJobProcessor.name);

  constructor(
    private stravaService: StravaService,
    private activityEffortsCreationService: ActivityEffortsCreationService,
    private transactionRunner: TransactionRunner,
    private jobEnqueuer: JobEnqueuerService,
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
    await this.jobEnqueuer.enqueue<StravaActivityAnalysisJob>(
      STRAVA_ACTIVITY_ANALYSIS_JOB,
      {
        stravaActivityId: job.stravaActivityId,
        stravaAthleteId: job.stravaAthleteId,
      },
    );
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

      await this.activityEffortsCreationService.extractAndCreateEfforts(
        athlete,
        activity,
        stravaActivity,
        manager,
      );
    });
  }
}
