import { Injectable, Logger } from '@nestjs/common';
import { StravaActivityRepository } from './repositories/strava-activity.repository';
import { StravaAchievementEffortRepository } from './repositories/strava-achievement-effort.repository';
import { StravaSegmentEffortRepository } from './repositories/strava-segment-effort.repository';
import { StravaAthlete } from './entities/strava-athlete.entity';

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
    private segmentEffortsRepo: StravaSegmentEffortRepository,
    private achievementEffortsRepo: StravaAchievementEffortRepository,
  ) {}

  public async getAthleteStats(athleteId: number): Promise<AthleteStats> {
    const athlete = { id: athleteId } as StravaAthlete;

    const [
      activityCount,
      segmentEffortCount,
      segmentCount,
      achievementEffortCount,
    ] = await Promise.all([
      this.activityRepo.countActivitiesForAthlete(athlete),
      this.segmentEffortsRepo.countEffortsForAthlete(athlete),
      this.segmentEffortsRepo.countSegmentsForAthlete(athlete),
      this.achievementEffortsRepo.countEffortsForAthlete(athlete),
    ]);
    return {
      activityCount,
      segmentEffortCount,
      segmentCount,
      achievementEffortCount,
    };
  }
}
