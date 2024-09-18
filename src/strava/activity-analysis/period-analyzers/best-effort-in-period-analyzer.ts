import { Logger } from '@nestjs/common';
import { RankedAchievement } from '../analyzer';

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

    let lastRank: number | undefined;
    for (const period of rankPeriods) {
      const rank = this.rank(
        this.activity,
        this.activities,
        period.cutoffDate,
        this.analysisParams.field,
      );
      if (rank) {
        if (lastRank && rank >= lastRank) {
          lastRank = rank;
          break;
        }
        lastRank = rank;
        if (rank <= 3) {
          achievements.push({
            rank,
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
