import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StravaActivity } from './entities/strava-activity.entity';
import { StravaSegmentEffort } from './entities/strava-segment-effort.entity';
import { StravaAchievementEffort } from './entities/strava-achievement-effort.entity';

export interface OnboardingStatus {
  activitiesSynched: boolean;
  segmentEffortsSynched: boolean;
  activity_percentage: number;
  segment_effort_percentage: number;
}

export interface AthleteStats {
  activityCount: number;
  segmentEffortCount: number;
  segmentCount: number;
  achievementEffortCount: number;
}

@Injectable()
export class AthleteStatisticsService {
  private readonly logger = new Logger(AthleteStatisticsService.name);

  constructor(
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
    @InjectRepository(StravaSegmentEffort)
    private segmentEffortsRepo: Repository<StravaSegmentEffort>,
    @InjectRepository(StravaAchievementEffort)
    private achievementEffortsRepo: Repository<StravaAchievementEffort>,
  ) {}

  public async getAthleteStats(athleteId: number): Promise<AthleteStats> {
    const activityCountPromise = this.activityRepo.count({
      where: { athlete: { id: athleteId } },
    });

    const segmentEffortCountPromise = this.segmentEffortsRepo.count({
      where: { athlete: { id: athleteId } },
    });

    const segmentCountPromise = this.segmentEffortsRepo.query(
      'SELECT COUNT(DISTINCT "segmentId") FROM strava_segment_effort WHERE "athleteId" = $1',
      [athleteId],
    );

    const achievementEffortCountPromise = this.achievementEffortsRepo.count({
      where: { athlete: { id: athleteId } },
    });

    const [
      activityCount,
      segmentEffortCount,
      [segmentCount],
      achievementEffortCount,
    ] = await Promise.all([
      activityCountPromise,
      segmentEffortCountPromise,
      segmentCountPromise,
      achievementEffortCountPromise,
    ]);
    return {
      activityCount,
      segmentEffortCount,
      segmentCount: segmentCount.count,
      achievementEffortCount,
    };
  }
}
