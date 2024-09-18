import { StravaActivity } from '../../entities/strava-activity.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StravaAchievementEffort } from '../../entities/strava-achievement-effort.entity';
import { AbstractGroupedAnalyzer } from './abstract-grouped-analyzer';
import { StravaAthlete } from '../../entities/strava-athlete.entity';
import { describeRank } from '../rank-utils';
import { AnalysisParams } from '../period-analyzers/best-effort-in-period-analyzer';
import { isNumber } from '@nestjs/common/utils/shared.utils';

export class AchievementEffortsAnalyzer extends AbstractGroupedAnalyzer<StravaAchievementEffort> {
  constructor(
    @InjectRepository(StravaAchievementEffort)
    private achievementEffortRepository: Repository<StravaAchievementEffort>,
  ) {
    super();
  }

  getEfforts(activity: StravaActivity): Promise<StravaAchievementEffort[]> {
    return activity.achievementEfforts;
  }

  getHistoricalEffortsForSameEntity(
    athlete: StravaAthlete,
    entity: StravaAchievementEffort,
    fromDate: Date,
  ): Promise<StravaAchievementEffort[]> {
    return this.achievementEffortRepository.find({
      where: {
        effortName: entity.effortName,
        athlete,
        startDate: Between(fromDate, entity.startDate),
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  getAnalysisParams(): AnalysisParams[] {
    return [
      {
        field: 'movingTime',
        order: 'smallest',
        rankDescriptionGenerator: this.generateRankDescription,
        hashGenerator: this.generateResultHash,
      },
    ];
  }

  private async generateRankDescription(
    rank: number,
    entity: StravaAchievementEffort,
    periodDescription: string,
  ): Promise<string> {
    return `${describeRank(rank)} fastest ${entity.effortName} ${periodDescription}`;
  }

  private async generateResultHash(
    rank: number,
    entity: StravaAchievementEffort,
  ): Promise<string> {
    return `${entity.effortName}-${rank}`;
  }
}
