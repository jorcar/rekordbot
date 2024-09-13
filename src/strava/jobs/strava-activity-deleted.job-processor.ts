import { StravaService } from '../strava.service';
import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import { STRAVA_ACTIVITY_DELETED_JOB, StravaActivityDeletedJob } from '../jobs';

@JobProcessor(STRAVA_ACTIVITY_DELETED_JOB)
export class StravaActivityDeletedJobProcessor
  implements QueuedJobProcessor<StravaActivityDeletedJob>
{
  constructor(private stravaService: StravaService) {}

  async processJob(job: StravaActivityDeletedJob): Promise<void> {
    // FIXME: delete from db
    throw new Error('Method not implemented.');
  }
}
