import { StravaService } from '../strava.service';
import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import { STRAVA_ACTIVITY_UPDATED_JOB, StravaActivityUpdatedJob } from './jobs';

@JobProcessor(STRAVA_ACTIVITY_UPDATED_JOB)
export class StravaActivityUpdatedJobProcessor
  implements QueuedJobProcessor<StravaActivityUpdatedJob>
{
  constructor(private stravaService: StravaService) {}

  async processJob(job: StravaActivityUpdatedJob): Promise<void> {
    // FIXME: delete from db
    throw new Error('Method not implemented.');
  }
}
