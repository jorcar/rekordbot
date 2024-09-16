import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import {
  STRAVA_ACTIVITY_ANALYSIS_JOB,
  StravaActivityAnalysisJob,
} from './jobs';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StravaActivity } from '../entities/strava-activity.entity';
import { Repository } from 'typeorm';

@JobProcessor(STRAVA_ACTIVITY_ANALYSIS_JOB)
export class StravaActivityAnalysisJobProcessor
  implements QueuedJobProcessor<StravaActivityAnalysisJob>
{
  private readonly logger = new Logger(StravaActivityAnalysisJobProcessor.name);
  constructor(
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
  ) {}

  async processJob(job: StravaActivityAnalysisJob): Promise<void> {
    this.logger.log(`Analyzing activity ${job.stravaActivityId}`);
    // load activity from db
    const activity = await this.activityRepo.findOneOrFail({
      where: { stravaId: job.stravaActivityId },
    });
    const athlete = await activity.athlete;
    // TODO: limit to last 12 months
    const allActivitiesOfType = await this.activityRepo.find({
      where: {
        sportType: activity.sportType,
        athlete: athlete,
      },
      order: {
        startDate: 'DESC',
      },
    });

    this.logger.debug(
      `Found ${allActivitiesOfType.length} activities of type ${activity.sportType}`,
    );
  }
}

// activity efforts
// of same type:
// longest (distance)
// longest (time)
// most elevation
// anniversary (10, 15, 20, 25, 30, all days in a month)
// anniversary (20, 25, 30, 40 , 50 ,60 in the last 3 months)
// most activities in a month (last 12 months, last 9 months last 6 months)
// most activities in a week (last 12 months, last 9 months last 6 months, last 3 months)
