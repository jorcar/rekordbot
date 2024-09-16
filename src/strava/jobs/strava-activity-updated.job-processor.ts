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
import { StravaActivity } from '../entities/strava-activity.entity';

@JobProcessor(STRAVA_ACTIVITY_UPDATED_JOB)
export class StravaActivityUpdatedJobProcessor
  implements QueuedJobProcessor<StravaActivityUpdatedJob>
{
  constructor(
    private stravaService: StravaService,
    private jobEnqueuer: JobEnqueuerService,
    private transactionRunner: TransactionRunner,
  ) {}

  async processJob(job: StravaActivityUpdatedJob): Promise<void> {
    await this.transactionRunner.runInTransaction(async (manager) => {
      // TODO: might make sense doing this in a separate repo so we dont scatter db details all over the code
      await manager.update(
        StravaActivity,
        { where: { stravaId: job.stravaActivityId } },
        { sportType: job.activityType },
      );
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
