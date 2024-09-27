import { StravaService } from '../strava.service';
import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import {
  STRAVA_ACTIVITY_ANALYSIS_JOB,
  STRAVA_ACTIVITY_UPDATED_JOB,
  StravaActivityAnalysisJob,
  StravaActivityUpdatedJob,
} from './jobs';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';
import { TransactionRunner } from '../transaction-runner.provider';
import { StravaActivityRepository } from '../repositories/strava-activity.repository';

@JobProcessor(STRAVA_ACTIVITY_UPDATED_JOB)
export class StravaActivityUpdatedJobProcessor
  implements QueuedJobProcessor<StravaActivityUpdatedJob>
{
  constructor(
    private stravaService: StravaService,
    private jobEnqueuer: JobEnqueuerService,
    private transactionRunner: TransactionRunner,
    private stravaActivityRepository: StravaActivityRepository,
  ) {}

  async processJob(job: StravaActivityUpdatedJob): Promise<void> {
    await this.transactionRunner.runInTransaction(async (manager) => {
      await this.stravaActivityRepository
        .transactional(manager)
        .updateActivity(job.stravaActivityId, { sportType: job.activityType });

      await this.jobEnqueuer.enqueue<StravaActivityAnalysisJob>(
        STRAVA_ACTIVITY_ANALYSIS_JOB,
        {
          stravaActivityId: job.stravaActivityId,
          stravaAthleteId: job.stravaAthleteId,
        },
      );
    });
  }
}
