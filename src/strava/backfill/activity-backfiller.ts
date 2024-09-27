import { PartialBackfiller } from './backfiller';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { StravaBackfillStatus } from '../entities/strava-backfill-status.entity';
import { Injectable, Logger } from '@nestjs/common';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { SimpleStravaApiActivity } from '../strava-api.service';
import { createStravaActivityRecord } from '../entities/entity-factory';
import { StravaService } from '../strava.service';
import { StravaActivityRepository } from '../repositories/strava-activity.repository';

@Injectable()
export class ActivityBackfiller implements PartialBackfiller {
  private readonly logger = new Logger(ActivityBackfiller.name);
  constructor(
    private stravaService: StravaService,
    private stravaActivityRepository: StravaActivityRepository,
  ) {}

  public async backfill(
    backfillStatus: StravaBackfillStatus,
    manager: EntityManager,
  ): Promise<void> {
    const done = await this.backfillPageOfActivities(
      await backfillStatus.athlete,
      manager,
      backfillStatus,
    );
    if (done) {
      backfillStatus.progress.activitiesSynched = true;
    }
    backfillStatus.progress.processedPages += 1;
    backfillStatus.updatedAt = new Date();
    this.logger.log(
      `Processed pages ${backfillStatus.progress.processedPages}. done: ${done}`,
    );
  }

  private async backfillPageOfActivities(
    athlete: StravaAthlete,
    manager: EntityManager,
    backfillStatus: StravaBackfillStatus,
  ) {
    const activities = await this.stravaService.fetchActivities(
      athlete.stravaId,
      new Date(backfillStatus.progress.synchUntil),
      backfillStatus.progress.processedPages + 1,
      200,
    );
    await this.createActivities(activities, athlete, manager);
    return (
      activities.length < 200 ||
      activities[activities.length - 1].start_date <
        backfillStatus.progress.synchCutOff
    );
  }

  private async createActivities(
    activities: SimpleStravaApiActivity[],
    athlete: StravaAthlete,
    manager: EntityManager,
  ) {
    for (const activity of activities) {
      await this.stravaActivityRepository
        .transactional(manager)
        .saveActivity(createStravaActivityRecord(activity, athlete));
    }
  }
}
