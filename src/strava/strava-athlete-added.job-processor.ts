import { StravaService } from './strava.service';
import { JobProcessor, QueuedJobProcessor } from '../jobs/job-processor';

export const STRAVA_ATHLETE_ADDED_JOB = 'strava-athlete-added';

export interface StravaAthleteAddedJob {
  athleteId: number;
}

@JobProcessor(STRAVA_ATHLETE_ADDED_JOB)
export class StravaAthleteAddedJobProcessor
  implements QueuedJobProcessor<StravaAthleteAddedJob>
{
  constructor(
    //@Inject() private jobPublisher: JobsPublisherService,
    private stravaService: StravaService,
  ) {}

  async processJob(job: StravaAthleteAddedJob): Promise<void> {
    await this.stravaService.registerWebhook(job.athleteId);
    /*await this.jobPublisher.enqueue(STRAVA_BACKFILL_JOB, {
      athleteId: job.athleteId,
    });*/
  }
}
