import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StravaActivity } from './entities/strava-activity.entity';
import { StravaSegmentEffort } from './entities/strava-segment-effort.entity';
import { StravaAchievementEffort } from './entities/strava-achievement-effort.entity';
import { StravaBackfillStatus } from './entities/strava-backfill-status.entity';
import { Achievement } from '../strava-analysis/achievement.entity';

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
  achievementCount: number;
}

@Injectable()
export class AthleteStatisticsService {
  private readonly logger = new Logger(AthleteStatisticsService.name);

  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
    @InjectRepository(StravaSegmentEffort)
    private segmentEffortsRepo: Repository<StravaSegmentEffort>,
    @InjectRepository(StravaAchievementEffort)
    private achievementEffortsRepo: Repository<StravaAchievementEffort>,
    @InjectRepository(StravaBackfillStatus)
    private backfillStatusRepository: Repository<StravaBackfillStatus>,
  ) {}

  public async getOnboardingStatus(
    atheleteId: number,
  ): Promise<OnboardingStatus | undefined> {
    const backfillStatus = await this.backfillStatusRepository.findOne({
      where: { athlete: { id: atheleteId } },
    });
    if (!backfillStatus) {
      return undefined;
    }
    return {
      activitiesSynched: backfillStatus.progress.activitiesSynched,
      segmentEffortsSynched: backfillStatus.progress.segmentEffortsSynched,
      activity_percentage: backfillStatus.progress.activitiesSynched
        ? 100
        : Math.round(
            (backfillStatus.progress.processedPages /
              (backfillStatus.progress.processedPages + 2)) *
              100,
          ),
      segment_effort_percentage: Math.round(
        ((backfillStatus.progress.lastProcessedActivityIdx || 0) /
          (backfillStatus.progress.processedPages * 200)) *
          100,
      ),
    };
  }

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

    const achievementCountPromise = this.achievementRepository.count({
      where: { athlete: { id: athleteId } },
    });

    const [
      activityCount,
      segmentEffortCount,
      [segmentCount],
      achievementEffortCount,
      achievementCount,
    ] = await Promise.all([
      activityCountPromise,
      segmentEffortCountPromise,
      segmentCountPromise,
      achievementEffortCountPromise,
      achievementCountPromise,
    ]);
    return {
      activityCount,
      segmentEffortCount,
      segmentCount: segmentCount.count,
      achievementEffortCount,
      achievementCount,
    };
  }
}
