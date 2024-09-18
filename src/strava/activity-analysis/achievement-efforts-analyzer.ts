import { StravaActivity } from '../entities/strava-activity.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StravaAchievementEffort } from '../entities/strava-achievement-effort.entity';
import { AbstractEffortAnalyzer } from './abstract-effort-analyzer';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { describeRank } from './rank-utils';

export class AchievementEffortsAnalyzer extends AbstractEffortAnalyzer<StravaAchievementEffort> {
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

  async generateRankDescription(
    rank: number,
    entity: StravaAchievementEffort,
    periodDescription: string,
  ): Promise<string> {
    return `${describeRank(rank)} fastest ${entity.effortName} ${periodDescription}`;
  }
}
