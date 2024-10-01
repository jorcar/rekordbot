import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StravaSegmentEffort } from './entities/strava-segment-effort.entity';
import { StravaAchievementEffort } from './entities/strava-achievement-effort.entity';
import { StravaActivityRepository } from './repositories/strava-activity.repository';

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
    private activityRepo: StravaActivityRepository,
    @InjectRepository(StravaSegmentEffort)
    private segmentEffortsRepo: Repository<StravaSegmentEffort>,
    @InjectRepository(StravaAchievementEffort)
    private achievementEffortsRepo: Repository<StravaAchievementEffort>,
  ) {}

  public async getAthleteStats(athleteId: number): Promise<AthleteStats> {
    const athlete = { athlete: { id: athleteId } } as any;
    const activityCountPromise =
      this.activityRepo.countActivitiesForAthlete(athlete);

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
