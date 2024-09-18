import { Analyzer, RankedAchievement } from './analyzer';
import { StravaActivity } from '../entities/strava-activity.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FixedPeriodBestEffortAnalyzer } from './period-analyzers/fixed-period-analyzer';
import { RelativePeriodBestEffortAnalyzer } from './period-analyzers/relative-period-analyzer';
import {
  AnalysisParams,
  BestEffortInPeriodAnalyzer,
} from './period-analyzers/best-effort-in-period-analyzer';
import { describeRank } from './rank-utils';

export class ActivityAchievementsAnalyzer implements Analyzer {
  constructor(
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
  ) {}

  async analyze(
    activity: StravaActivity,
    fromDate: Date,
  ): Promise<RankedAchievement[]> {
    const athlete = await activity.athlete;
    const allActivitiesOfType = await this.activityRepo.find({
      where: {
        sportType: activity.sportType,
        athlete: athlete,
        startDate: Between(fromDate, activity.startDate),
      },
      order: {
        startDate: 'DESC',
      },
    });

    const distanceAnalysisParams: AnalysisParams = {
      field: 'distance',
      order: 'largest',
      rankDescriptionGenerator: this.generateLongestDistanceDescription,
    };

    const timeAnalysisParams: AnalysisParams = {
      field: 'movingTime',
      order: 'largest',
      rankDescriptionGenerator: this.generateLongestDurationDescription,
    };

    const biggestClimbAnalysisParams: AnalysisParams = {
      field: 'totalElevationGain',
      order: 'largest',
      rankDescriptionGenerator: this.generateBiggestClimbDescription,
    };

    const analyzers: BestEffortInPeriodAnalyzer<StravaActivity>[] = [
      new FixedPeriodBestEffortAnalyzer(
        activity,
        allActivitiesOfType,
        distanceAnalysisParams,
      ),
      new RelativePeriodBestEffortAnalyzer(
        activity,
        allActivitiesOfType,
        distanceAnalysisParams,
      ),
      new FixedPeriodBestEffortAnalyzer(
        activity,
        allActivitiesOfType,
        timeAnalysisParams,
      ),
      new RelativePeriodBestEffortAnalyzer(
        activity,
        allActivitiesOfType,
        timeAnalysisParams,
      ),
      new FixedPeriodBestEffortAnalyzer(
        activity,
        allActivitiesOfType,
        biggestClimbAnalysisParams,
      ),
      new RelativePeriodBestEffortAnalyzer(
        activity,
        allActivitiesOfType,
        biggestClimbAnalysisParams,
      ),
    ];

    const results: RankedAchievement[] = [];
    for (const analyzer of analyzers) {
      results.push(...(await analyzer.analyze()));
    }
    return results;
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
