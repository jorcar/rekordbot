import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import {
  STRAVA_ACTIVITY_DELETED_JOB,
  StravaActivityDeletedJob,
} from '../../jobs';
import { Logger } from '@nestjs/common';
import { StravaActivityRepository } from '../repositories/strava-activity.repository';

@JobProcessor(STRAVA_ACTIVITY_DELETED_JOB)
export class StravaActivityDeletedJobProcessor
  implements QueuedJobProcessor<StravaActivityDeletedJob>
{
  private readonly logger = new Logger(StravaActivityDeletedJobProcessor.name);
  constructor(private activityRepository: StravaActivityRepository) {}

  async processJob(job: StravaActivityDeletedJob): Promise<void> {
    this.logger.log(`Deleting activity ${job.stravaActivityId}`);
    await this.activityRepository.deleteActivity(job.stravaActivityId);
  }
}
