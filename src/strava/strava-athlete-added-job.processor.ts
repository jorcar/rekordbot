import { JobProcessor, QueuedJobProcessor } from '../job/job-processor';
import { StravaService } from './strava.service';
import { STRAVA_ATHLETE_ADDED_JOB, StravaAthleteAddedJob } from './jobs';

@JobProcessor(STRAVA_ATHLETE_ADDED_JOB)
export class StravaAthleteAddedJobProcessor
  implements QueuedJobProcessor<StravaAthleteAddedJob>
{
  constructor(private stravaService: StravaService) {}

  async processJob(job: StravaAthleteAddedJob): Promise<void> {
    console.log('Backfilling data for athlete', job.athleteId);
    await this.stravaService.registerWebhook(job.athleteId);
  }
}
