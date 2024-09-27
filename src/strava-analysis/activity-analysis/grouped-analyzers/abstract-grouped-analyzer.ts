import { StravaActivity } from '../../../strava/entities/strava-activity.entity';
import { FixedPeriodBestEffortAnalyzer } from '../period-analyzers/fixed-period-analyzer';
import { Logger } from '@nestjs/common';
import { RelativePeriodBestEffortAnalyzer } from '../period-analyzers/relative-period-analyzer';
import {
  AnalysisParams,
  BestEffortInPeriodAnalyzer,
  RankableActivity,
} from '../period-analyzers/best-effort-in-period-analyzer';
import { StravaAthlete } from '../../../strava/entities/strava-athlete.entity';

export interface RankedAchievement {
  cutOffDate: Date;
  rank: number;
  description: string;
  hash: string;
}

export abstract class AbstractGroupedAnalyzer<T extends RankableActivity> {
  private readonly logger = new Logger(AbstractGroupedAnalyzer.name);

  abstract getEfforts(activity: StravaActivity): Promise<T[]>;

  abstract getHistoricalEffortsForSameEntity(
    athlete: StravaAthlete,
    entity: T,
    fromDate: Date,
  ): Promise<T[]>;

  abstract getAnalysisParams(): AnalysisParams[];

  async analyze(
    activity: StravaActivity,
    fromDate: Date,
  ): Promise<RankedAchievement[]> {
    const athlete = await activity.athlete;
    const effortsToAnalyze = await this.getEfforts(activity);
    this.logger.debug(`${effortsToAnalyze.length} efforts found for analysis`);

    const results: RankedAchievement[] = [];
    for (const effort of effortsToAnalyze) {
      const historicalEfforts = await this.getHistoricalEffortsForSameEntity(
        athlete,
        effort,
        fromDate,
      );
      this.logger.debug(
        `${historicalEfforts.length} historical efforts found for entity`,
      );
      const analyzers = this.buildPeriodAnalyzers(effort, historicalEfforts);

      for (const analyzer of analyzers) {
        results.push(...(await analyzer.analyze()));
      }
    }
    return results;
  }

  private buildPeriodAnalyzers(effort: T, efforts: T[]) {
    const analyzers: BestEffortInPeriodAnalyzer<T>[] = [];
    for (const analysisParam of this.getAnalysisParams()) {
      analyzers.push(
        new FixedPeriodBestEffortAnalyzer<T>(effort, efforts, analysisParam),
      );
      analyzers.push(
        new RelativePeriodBestEffortAnalyzer<T>(effort, efforts, analysisParam),
      );
    }
    return analyzers;
  }
}
