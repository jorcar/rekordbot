import { PartialBackfiller } from './backfiller';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { StravaBackfillStatus } from '../strava-backfill-status.entity';
import { Injectable, Logger } from '@nestjs/common';
import { StravaService } from '../../strava/strava.service';
import { StravaActivityRepository } from '../../strava/repositories/strava-activity.repository';
import { ActivityEffortsCreationService } from '../../strava/jobs/activity-efforts-creation.service';

@Injectable()
export class EffortBackfiller implements PartialBackfiller {
  private readonly logger = new Logger(EffortBackfiller.name);
  constructor(
    private stravaService: StravaService,
    private stravaActivityRepository: StravaActivityRepository,
    private activityEffortCreationService: ActivityEffortsCreationService,
  ) {}

  public async backfill(
    backfillStatus: StravaBackfillStatus,
    manager: EntityManager,
  ): Promise<void> {
    const athlete = await backfillStatus.athlete;
    const index = isNaN(backfillStatus.progress.lastProcessedActivityIdx)
      ? 0
      : backfillStatus.progress.lastProcessedActivityIdx + 1;

    const activity = await this.stravaActivityRepository
      .transactional(manager)
      .findNthActivityForAthlete(athlete, index);

    backfillStatus.progress.lastProcessedActivityIdx = index;
    backfillStatus.updatedAt = new Date();
    if (!activity) {
      this.logger.log('No activity found, backfill complete!');
      backfillStatus.progress.segmentEffortsSynched = true;
    } else {
      this.logger.log(`Processing activity ${activity.stravaId}`);
      const stravaActivity = await this.stravaService.fetchActivity(
        activity.stravaId,
        athlete.stravaId,
      );
      await this.activityEffortCreationService.extractAndCreateEfforts(
        athlete,
        stravaActivity,
        activity,
        manager,
      );
    }
  }
}
