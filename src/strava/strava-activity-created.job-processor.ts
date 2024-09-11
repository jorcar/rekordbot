import { StravaService } from './strava.service';
import { JobProcessor, QueuedJobProcessor } from '../job/job-processor';
import { STRAVA_ACTIVITY_CREATED_JOB, StravaActivityCreatedJob } from './jobs';

@JobProcessor(STRAVA_ACTIVITY_CREATED_JOB)
export class StravaActivityCreatedJobProcessor
  implements QueuedJobProcessor<StravaActivityCreatedJob>
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
