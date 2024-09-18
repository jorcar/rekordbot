import { Analyzer, RankedAchievement } from './analyzer';
import { StravaActivity } from '../entities/strava-activity.entity';
import { FixedPeriodBestEffortAnalyzer } from './period-analyzers/fixed-period-analyzer';
import { Logger } from '@nestjs/common';
import { RelativePeriodBestEffortAnalyzer } from './period-analyzers/relative-period-analyzer';
import {
  AnalysisParams,
  RankableActivity,
} from './period-analyzers/best-effort-in-period-analyzer';
import { StravaAthlete } from '../entities/strava-athlete.entity';

export abstract class AbstractEffortAnalyzer<T extends RankableActivity>
  implements Analyzer
{
  private readonly logger = new Logger(AbstractEffortAnalyzer.name);

  abstract getEfforts(activity: StravaActivity): Promise<T[]>;
  abstract getHistoricalEffortsForSameEntity(
    athlete: StravaAthlete,
    entity: T,
    fromDate: Date,
  ): Promise<T[]>;
  abstract generateRankDescription(
    rank: number,
    entity: T,
    periodDescription: string,
  ): Promise<string>;

  async analyze(
    activity: StravaActivity,
    fromDate: Date,
  ): Promise<RankedAchievement[]> {
    const athlete = await activity.athlete;
    const efforts = await this.getEfforts(activity);
    this.logger.debug(`${efforts.length} efforts found`);
    const results: RankedAchievement[] = [];
    for (const effort of efforts) {
      const allEfforts = await this.getHistoricalEffortsForSameEntity(
        athlete,
        effort,
        fromDate,
      );
      this.logger.debug(
        `${allEfforts.length}  efforts found for ${effort.stravaId}`,
      );

      const analysisParams: AnalysisParams = {
        field: 'movingTime',
        order: 'smallest',
        rankDescriptionGenerator: this.generateRankDescription,
      };

      const analyzers = [
        new FixedPeriodBestEffortAnalyzer<T>(effort, efforts, analysisParams),
        new RelativePeriodBestEffortAnalyzer(effort, efforts, analysisParams),
      ];

      for (const analyzer of analyzers) {
        results.push(...(await analyzer.analyze()));
      }
    }
    return results;
  }
}
