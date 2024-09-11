import { JobProcessor, QueuedJobProcessor } from '../job-q/job-processor';

export const STRAVA_BACKFILL_JOB = 'strava-backfill';

export interface StravaBackfillJob {
  athleteId: number;
}

@JobProcessor(STRAVA_BACKFILL_JOB)
export class StravaBackfillJobProcessor
  implements QueuedJobProcessor<StravaBackfillJob>
{
  constructor() {}

  async processJob(job: StravaBackfillJob): Promise<void> {
    console.log('Backfilling data for athlete', job.athleteId);
  }
}
