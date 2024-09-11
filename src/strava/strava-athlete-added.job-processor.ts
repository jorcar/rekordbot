import { StravaService } from './strava.service';
import { JobProcessor, QueuedJobProcessor } from '../job-q/job-processor';
import { JobEnqueuerService } from '../job-q/job-enqueuer.service';
import {
  STRAVA_BACKFILL_JOB,
  StravaBackfillJob,
} from './strava-backfill.job-processor';

export const STRAVA_ATHLETE_ADDED_JOB = 'strava-athlete-added';

export interface StravaAthleteAddedJob {
  athleteId: number;
}

@JobProcessor(STRAVA_ATHLETE_ADDED_JOB)
export class StravaAthleteAddedJobProcessor
  implements QueuedJobProcessor<StravaAthleteAddedJob>
{
  constructor(
    private jobPublisher: JobEnqueuerService,
    private stravaService: StravaService,
  ) {}

  async processJob(job: StravaAthleteAddedJob): Promise<void> {
    await this.stravaService.registerWebhook(job.athleteId);
    await this.jobPublisher.enqueue<StravaBackfillJob>(STRAVA_BACKFILL_JOB, {
      athleteId: job.athleteId,
    });
  }
}
