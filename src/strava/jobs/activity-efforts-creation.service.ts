import { Injectable, Logger } from '@nestjs/common';
import {
  createStravaAchievementEffortRecord,
  createStravaSegmentEffortRecord,
  createStravaSegmentRecord,
} from '../entities/entity-factory';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { Segment, StravaApiActivity } from '../strava-api.service';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { StravaSegment } from '../entities/strava-segment.entity';
import { StravaActivity } from '../entities/strava-activity.entity';
import { StravaSegmentRepository } from '../repositories/strava-segment.repository';
import { StravaSegmentEffortRepository } from '../repositories/strava-segment-effort.repository';
import { StravaAchievementEffortRepository } from '../repositories/strava-achievement-effort.repository';

@Injectable()
export class ActivityEffortsCreationService {
  private logger = new Logger(ActivityEffortsCreationService.name);

  constructor(
    private segmentRepo: StravaSegmentRepository,
    private segmentEffortRepo: StravaSegmentEffortRepository,
    private achievementEffortRepo: StravaAchievementEffortRepository,
  ) {}

  public async extractAndCreateEfforts(
    athlete: StravaAthlete,
    stravaActivity: StravaApiActivity,
    activity: StravaActivity,
    entityManager: EntityManager,
  ) {
    await this.saveSegmentEfforts(
      stravaActivity,
      athlete,
      activity,
      entityManager,
    );
    await this.saveBestEfforts(
      stravaActivity,
      athlete,
      activity,
      entityManager,
    );
  }

  private async saveBestEfforts(
    stravaActivity: StravaApiActivity,
    athlete: StravaAthlete,
    activity: StravaActivity,
    manager: EntityManager,
  ) {
    if (stravaActivity.best_efforts) {
      this.logger.debug(`Creating best efforts ${athlete.id}`);
      for (const activityBestEffort of stravaActivity.best_efforts) {
        const achievementEffort = await createStravaAchievementEffortRecord(
          activityBestEffort,
          activity,
          athlete,
        );
        this.logger.debug(`Storing best effort for athlete ${athlete.id}`);
        await this.achievementEffortRepo
          .transactional(manager)
          .saveAchievementEffort(achievementEffort);
      }
    }
  }

  private async saveSegmentEfforts(
    stravaActivity: StravaApiActivity,
    athlete: StravaAthlete,
    activity: StravaActivity,
    manager: EntityManager,
  ) {
    if (stravaActivity.segment_efforts) {
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
        await this.segmentEffortRepo
          .transactional(manager)
          .saveSegmentEffort(segmentEffort);
      }
    }
  }

  private async getOrCreateSegment(
    manager: EntityManager,
    segment: Segment,
  ): Promise<StravaSegment> {
    // TODO: consider refactoring to use stravaId as primary key to better handle duplicates
    const segmentRecord = await this.segmentRepo
      .transactional(manager)
      .findSegment(segment.id);
    if (segmentRecord) {
      return segmentRecord;
    }
    return await this.createSegmentRecord(manager, segment);
  }

  private async createSegmentRecord(
    manager: EntityManager,
    segment: Segment,
  ): Promise<StravaSegment> {
    const newSegment = createStravaSegmentRecord(segment);
    await this.segmentRepo.transactional(manager).saveSegment(newSegment);
    return newSegment;
  }
}
