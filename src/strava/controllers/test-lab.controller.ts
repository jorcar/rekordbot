import { Controller, Get, Logger } from '@nestjs/common';
import { StravaService } from '../strava.service';
import {
  STRAVA_ACTIVITY_ANALYSIS_JOB,
  STRAVA_BACKFILL_JOB,
  StravaActivityAnalysisJob,
} from '../jobs/jobs';
import { ThrottledScheduler } from '../jobs/throttled-scheduler.service';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';

@Controller('/strava/testlab')
export class TestLabController {
  private readonly logger = new Logger(TestLabController.name);

  constructor(
    private stravaService: StravaService,
    private jobEnqueuer: ThrottledScheduler,
    private job: JobEnqueuerService,
  ) {}

  @Get('backfill')
  get() {
    this.logger.log('Trigger backfill');
    return this.jobEnqueuer.enqueueThrottled(STRAVA_BACKFILL_JOB, {
      athleteId: 1,
    });
  }
  @Get('analyze')
  analyze() {
    this.logger.log('Trigger backfill');
    return this.job.enqueue<StravaActivityAnalysisJob>(
      STRAVA_ACTIVITY_ANALYSIS_JOB,
      {
        stravaActivityId: 12213188308,
        stravaAthleteId: 1168772,
      },
    );
  }
}

/*(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};*/
