import {
  JobProcessor,
  JobProcessorProvider,
} from '../jobs/job-processor.provider';

export const STRAVA_BACKFILL_JOB = 'strava-backfill';

export interface StravBackfillJob {
  athleteId: number;
}

@JobProcessor(STRAVA_BACKFILL_JOB)
export class StravaBackfillJobProcessor
  implements JobProcessorProvider<StravBackfillJob>
{
  constructor() {}

  async processJob(job: StravBackfillJob): Promise<void> {
    console.log('Backfilling data for athlete', job.athleteId);
  }
}
