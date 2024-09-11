import {
  JobProcessor,
  JobProcessorProvider,
} from '../jobs/job-processor.provider';
import { StravaService } from './strava.service';
import { JobsPublisherService } from '../jobs/jobs-publisher.service';
import { STRAVA_BACKFILL_JOB } from './strava-backfill.job-processor';
import { Inject } from '@nestjs/common';

export const STRAVA_ATHLETE_ADDED_JOB = 'strava-athlete-added';

export interface StravaAthleteAddedJob {
  athleteId: number;
}

@JobProcessor(STRAVA_ATHLETE_ADDED_JOB)
export class StravaAthleteAddedJobProcessor
  implements JobProcessorProvider<StravaAthleteAddedJob>
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
