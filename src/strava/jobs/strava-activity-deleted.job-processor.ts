import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import { STRAVA_ACTIVITY_DELETED_JOB, StravaActivityDeletedJob } from './jobs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StravaActivity } from '../entities/strava-activity.entity';
import { Logger } from '@nestjs/common';

@JobProcessor(STRAVA_ACTIVITY_DELETED_JOB)
export class StravaActivityDeletedJobProcessor
  implements QueuedJobProcessor<StravaActivityDeletedJob>
{
  private readonly logger = new Logger(StravaActivityDeletedJobProcessor.name);
  constructor(
    @InjectRepository(StravaActivity)
    private activityRepository: Repository<StravaActivity>,
  ) {}

  async processJob(job: StravaActivityDeletedJob): Promise<void> {
    this.logger.log(`Deleting activity ${job.stravaActivityId}`);
    await this.activityRepository.delete({ stravaId: job.stravaActivityId });
  }
}
