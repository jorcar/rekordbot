import {
  JobProcessor,
  JobProcessorProvider,
} from '../jobs/job-processor.provider';
import { Inject } from '@nestjs/common';
import { StravaService } from './strava.service';

export const STRAVA_ACTIVITY_CREATED_JOB = 'strava-activity-created';

export interface StravaActivityCreatedJob {
  stravaAthleteId: number;
  stravaActivityId: number;
}

@JobProcessor(STRAVA_ACTIVITY_CREATED_JOB)
export class StravaActivityCreatedJobProcessor
  implements JobProcessorProvider<StravaActivityCreatedJob>
{
  constructor(private stravaService: StravaService) {}

  async processJob(job: StravaActivityCreatedJob): Promise<void> {
    const activity = await this.stravaService.fetchActivity(
      job.stravaActivityId,
      job.stravaAthleteId,
    );
    console.log(JSON.stringify(activity));
    // TODO: save it do the database
  }
}
