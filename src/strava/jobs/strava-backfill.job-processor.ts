import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import { StravaService } from '../strava.service';
import { STRAVA_BACKFILL_JOB, StravaBackfillJob } from '../jobs';

@JobProcessor(STRAVA_BACKFILL_JOB)
export class StravaBackfillJobProcessor
  implements QueuedJobProcessor<StravaBackfillJob>
{
  constructor(private stravaService: StravaService) {}

  async processJob(job: StravaBackfillJob): Promise<void> {
    console.log('Backfilling data for athlete', job.athleteId);
    await this.stravaService.registerWebhook(job.athleteId);
  }
}
