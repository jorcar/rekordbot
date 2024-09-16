import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import { StravaService } from '../strava.service';
import {
  STRAVA_ATHLETE_ADDED_JOB,
  STRAVA_BACKFILL_JOB,
  StravaAthleteAddedJob,
} from './jobs';
import { Logger } from '@nestjs/common';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';
import { BackfillScheduler } from './backfill-scheduler';

@JobProcessor(STRAVA_ATHLETE_ADDED_JOB)
export class StravaAthleteAddedJobProcessor
  implements QueuedJobProcessor<StravaAthleteAddedJob>
{
  private readonly logger = new Logger(StravaAthleteAddedJobProcessor.name);
  constructor(
    private stravaService: StravaService,
    private jobEnqueuer: BackfillScheduler,
  ) {}

  async processJob(job: StravaAthleteAddedJob): Promise<void> {
    this.logger.log(`Setting up webhook for athlete ${job.athleteId}`);
    await this.stravaService.registerWebhook(job.athleteId);
    await this.jobEnqueuer.enqueueThrottled(STRAVA_BACKFILL_JOB, {
      athleteId: job.athleteId,
    });
  }
}
