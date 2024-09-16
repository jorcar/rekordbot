import { Injectable, Logger } from '@nestjs/common';
import {
  createStravaSAchievementEffortRecord,
  createStravaSegmentEffortRecord,
} from '../entities/entity-factory';
import { StravaSegmentEffort } from '../entities/strava-segment-effort.entity';
import { StravaAchievementEffort } from '../entities/strava-achievement-effort.entity';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { StravaApiActivity } from '../strava-api.service';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { StravaSegment } from '../entities/strava-segment.entity';
import { StravaActivity } from '../entities/strava-activity.entity';

@Injectable()
export class ActivityEffortsCreationService {
  private logger = new Logger(ActivityEffortsCreationService.name);

  public async extractAndCreateEfforts(
    athlete: StravaAthlete,
    stravaActivity: StravaApiActivity,
    activity: StravaActivity,
    manager: EntityManager,
  ) {
    this.logger.debug(`Saving segment efforts for athlete ${athlete.id}`);
    for (const activitySegmentEffort of stravaActivity.segment_efforts) {
      const segment = await this.getOrCreateSegment(
        manager,
        activitySegmentEffort.segment,
      );
      this.logger.debug(
        `Creating segment efforts on segment ${segment.id}, ${segment.stravaId}, ${activitySegmentEffort.id}`,
      );
      const segmentEffort = createStravaSegmentEffortRecord(
        activitySegmentEffort,
        segment,
        activity,
        athlete,
      );
      await manager.save(StravaSegmentEffort, segmentEffort);
    }

    if (stravaActivity.best_efforts) {
      this.logger.debug(`Creating best efforts ${athlete.id}`);
      for (const activityBestEffort of stravaActivity.best_efforts) {
        const achievementEffort = await createStravaSAchievementEffortRecord(
          activityBestEffort,
          activity,
          athlete,
        );
        this.logger.debug(`Storing best effort for athlete ${athlete.id}`);
        await manager.save(StravaAchievementEffort, achievementEffort);
      }
    }
  }

  private async getOrCreateSegment(
    manager: EntityManager,
    segment: any,
  ): Promise<StravaSegment> {
    const segmentRecord = await manager.findOne(StravaSegment, {
      where: { stravaId: segment.id },
    });
    if (segmentRecord) {
      return segmentRecord;
    }
    return await this.createSegmentRecord(manager, segment);
  }

  private async createSegmentRecord(
    manager: EntityManager,
    segment: any,
  ): Promise<StravaSegment> {
    const newSegment = new StravaSegment();
    newSegment.stravaId = segment.id;
    newSegment.name = segment.name;
    await manager.save(newSegment);
    return newSegment;
  }
}
