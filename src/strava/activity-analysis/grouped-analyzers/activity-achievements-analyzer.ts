import { StravaActivity } from '../../entities/strava-activity.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalysisParams } from '../period-analyzers/best-effort-in-period-analyzer';
import { describeRank } from '../rank-utils';
import { AbstractGroupedAnalyzer } from './abstract-grouped-analyzer';
import { StravaAthlete } from '../../entities/strava-athlete.entity';

export class ActivityAchievementsAnalyzer extends AbstractGroupedAnalyzer<StravaActivity> {
  constructor(
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
  ) {
    super();
  }

  async getEfforts(activity: StravaActivity): Promise<StravaActivity[]> {
    return [activity];
  }

  async getHistoricalEffortsForSameEntity(
    athlete: StravaAthlete,
    entity: StravaActivity,
    fromDate: Date,
  ): Promise<StravaActivity[]> {
    const a = await this.activityRepo.find({
      where: {
        sportType: entity.sportType,
        athlete: athlete,
        startDate: Between(fromDate, entity.startDate),
      },
      order: {
        startDate: 'DESC',
      },
    });
    console.log(a.length);
    return a;
  }

  getAnalysisParams(): AnalysisParams[] {
    const distanceAnalysisParams: AnalysisParams = {
      field: 'distance',
      order: 'largest',
      rankDescriptionGenerator: this.generateLongestDistanceDescription,
      hashGenerator: async (rank, entity) => {
        return 'longest-distance-' + rank + entity.stravaId.toString();
      },
    };

    const timeAnalysisParams: AnalysisParams = {
      field: 'movingTime',
      order: 'largest',
      rankDescriptionGenerator: this.generateLongestDurationDescription,
      hashGenerator: async (rank, entity) => {
        return 'longest-duration-' + rank + entity.stravaId.toString();
      },
    };

    const biggestClimbAnalysisParams: AnalysisParams = {
      field: 'totalElevationGain',
      order: 'largest',
      rankDescriptionGenerator: this.generateBiggestClimbDescription,
      hashGenerator: async (rank, entity) => {
        return 'highest-elevation-' + rank + entity.stravaId.toString();
      },
    };
    return [
      distanceAnalysisParams,
      timeAnalysisParams,
      biggestClimbAnalysisParams,
    ];
  }

  private async generateLongestDistanceDescription(
    rank: number,
    entity: StravaActivity,
    periodDescription: string,
  ): Promise<string> {
    return `${describeRank(rank)} furthest ${entity.sportType.toLowerCase()} ${periodDescription}`;
  }

  private async generateLongestDurationDescription(
    rank: number,
    entity: StravaActivity,
    periodDescription: string,
  ): Promise<string> {
    return `${describeRank(rank)} longest ${entity.sportType.toLowerCase()} ${periodDescription}`;
  }

  private async generateBiggestClimbDescription(
    rank: number,
    _entity: StravaActivity,
    periodDescription: string,
  ): Promise<string> {
    return `${describeRank(rank)} biggest climb ${periodDescription}`;
  }
}
