import { Logger } from '@nestjs/common';
import { RankedAchievement } from '../grouped-analyzers/abstract-grouped-analyzer';

export interface RankableActivity {
  stravaId: any;
  startDate: Date;
}

export interface RankPeriod {
  cutoffDate: Date;
  description: string;
}

export interface AnalysisParams {
  field: string;
  order: 'smallest' | 'largest';
  rankDescriptionGenerator: (
    number,
    T,
    periodDescription: string,
  ) => Promise<string>;
  hashGenerator: (number, T) => Promise<string>;
}

export abstract class BestEffortInPeriodAnalyzer<T extends RankableActivity> {
  private readonly logger = new Logger(BestEffortInPeriodAnalyzer.name);
  private readonly activityType: string;
  protected constructor(
    protected activity: T,
    private activities: T[],
    private analysisParams: AnalysisParams,
  ) {}

  protected abstract getPeriods(): RankPeriod[];

  public async analyze(): Promise<RankedAchievement[]> {
    this.logger.debug(
      `Analyzing ${this.analysisParams.field} for activity ${this.activity.stravaId}`,
    );
    const achievements: RankedAchievement[] = [];
    const rankPeriods = this.getPeriods().sort(
      (a, b) => b.cutoffDate.getTime() - a.cutoffDate.getTime(),
    );

    // TODO: refactor this - lets push em all, add a hash of what it measures + rank and pick the ones with the longest distance
    for (const period of rankPeriods) {
      const rank = this.rank(
        this.activity,
        this.activities,
        period.cutoffDate,
        this.analysisParams.field,
      );
      if (rank) {
        if (rank <= 3) {
          achievements.push({
            rank,
            cutOffDate: period.cutoffDate,
            hash: await this.analysisParams.hashGenerator(rank, this.activity),
            description: await this.analysisParams.rankDescriptionGenerator(
              rank,
              this.activity,
              period.description,
            ),
          });
        }
      }
    }

    return achievements;
  }

  private rank<T extends RankableActivity>(
    activity: T,
    activities: T[],
    dateCutOff: Date,
    comparisonField: string,
  ): number | undefined {
    const activitiesInPeriod = activities.filter(
      (a) => a.startDate >= dateCutOff,
    );
    if (activitiesInPeriod.length < 2) {
      this.logger.debug(
        `Found only ${activitiesInPeriod.length} activities in rankin period beginning ${dateCutOff.toISOString()}`,
      );
      return undefined;
    }
    this.logger.debug(
      `Ranking ${this.analysisParams.field} for activity ${this.activity.stravaId} with ${activitiesInPeriod.length} activities in period from ${dateCutOff.toISOString()}`,
    );
    if (this.analysisParams.order === 'smallest') {
      activitiesInPeriod.sort(
        (a, b) => a[comparisonField] - b[comparisonField],
      );
    } else {
      activitiesInPeriod.sort(
        (a, b) => b[comparisonField] - a[comparisonField],
      );
    }
    const rank = activitiesInPeriod.findIndex(
      (a) => a.stravaId === activity.stravaId,
    );
    return rank + 1;
  }
}
