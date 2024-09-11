import { JobProcessor, QueuedJobProcessor } from '../jobs/job-processor';

export const STRAVA_BACKFILL_JOB = 'strava-backfill';

export interface StravBackfillJob {
  athleteId: number;
}

@JobProcessor(STRAVA_BACKFILL_JOB)
export class StravaBackfillJobProcessor
  implements QueuedJobProcessor<StravBackfillJob>
{
  constructor() {}

  async processJob(job: StravBackfillJob): Promise<void> {
    console.log('Backfilling data for athlete', job.athleteId);
  }
}
