import { Controller, Get, Logger, Req } from '@nestjs/common';
import { StravaService } from '../strava.service';
import { STRAVA_BACKFILL_JOB } from '../jobs/jobs';
import { BackfillScheduler } from '../jobs/backfill-scheduler';

@Controller('/strava/testlab')
export class TestLabController {
  private readonly logger = new Logger(TestLabController.name);

  constructor(
    private stravaService: StravaService,
    private jobEnqueuer: BackfillScheduler,
  ) {}

  @Get('backfill')
  get() {
    this.logger.log('Trigger backfill');
    return this.jobEnqueuer.enqueueThrottled(STRAVA_BACKFILL_JOB, {
      athleteId: 51,
    });
  }
}
