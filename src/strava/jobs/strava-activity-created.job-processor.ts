import { StravaService } from '../strava.service';
import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import {
  STRAVA_ACTIVITY_ANALYSIS_JOB,
  STRAVA_ACTIVITY_CREATED_JOB,
  StravaActivityAnalysisJob,
  StravaActivityCreatedJob,
} from '../../jobs';
import { Logger } from '@nestjs/common';
import { StravaApiActivity } from '../strava-api.service';
import { TransactionRunner } from '../../common/transaction-runner.provider';
import { createStravaActivityRecord } from '../entities/entity-factory';
import { ActivityEffortsCreationService } from '../activity-efforts-creation.service';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';
import { StravaActivityRepository } from '../repositories/strava-activity.repository';
import { StravaAthleteRepository } from '../repositories/strava-athlete.repository';

@JobProcessor(STRAVA_ACTIVITY_CREATED_JOB)
export class StravaActivityCreatedJobProcessor
  implements QueuedJobProcessor<StravaActivityCreatedJob>
{
  private readonly logger = new Logger(StravaActivityCreatedJobProcessor.name);

  constructor(
    private stravaService: StravaService,
    private activityEffortsCreationService: ActivityEffortsCreationService,
    private transactionRunner: TransactionRunner,
    private stravaActivityRepository: StravaActivityRepository,
    private stravaAthleteRepository: StravaAthleteRepository,
    private jobEnqueuer: JobEnqueuerService,
  ) {}

  async processJob(job: StravaActivityCreatedJob): Promise<void> {
    const activity = await this.stravaService.fetchActivity(
      job.stravaActivityId,
      job.stravaAthleteId,
    );
    this.logger.debug(`Found activity on Strava ${activity.id}`);
    await this.storeActivity(activity, job.stravaAthleteId);
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
    const athlete =
      await this.stravaAthleteRepository.findAthleteByStravaId(stravaAthleteId);
    await this.transactionRunner.runInTransaction(async (manager) => {
      this.logger.debug(`Saving activity for athlete ${athlete.id}`);
      const stravaActivity = createStravaActivityRecord(activity, athlete);
      await this.stravaActivityRepository
        .transactional(manager)
        .saveActivity(stravaActivity);

      await this.activityEffortsCreationService.extractAndCreateEfforts(
        athlete,
        activity,
        stravaActivity,
        manager,
      );
    });
  }
}
