import { DateTime } from 'luxon';
import { Logger } from '@nestjs/common';

export interface RankableActivity {
  stravaId: any;
  startDate: Date;
}

export interface RankPeriod {
  cutoffDate: Date;
  description: string;
}

export interface FieldDescription {
  field: string;
  description: string;
}

export abstract class BestEffortAnalyzer<T extends RankableActivity> {
  private readonly logger = new Logger(BestEffortAnalyzer.name);
  private activityType: string;
  protected constructor(
    protected activity: T,
    private activities: T[],
    private comparisonField: FieldDescription,
    activityType: string,
  ) {
    this.activityType = activityType.toLowerCase();
  }

  protected abstract createRankPeriods(): RankPeriod[];

  public analyze(): string[] {
    this.logger.debug(
      `Analyzing ${this.comparisonField.description} for activity ${this.activity.stravaId}`,
    );
    const achievements: string[] = [];
    const rankPeriods = this.createRankPeriods().sort(
      (a, b) => b.cutoffDate.getTime() - a.cutoffDate.getTime(),
    );

    // rank accordindg to ech period- however only include result from a new period if it is better than the previous

    let lastRank: number | undefined;
    for (const period of rankPeriods) {
      const rank = this.rank(
        this.activity,
        this.activities,
        period.cutoffDate,
        this.comparisonField.field,
      );
      if (rank) {
        if (lastRank && rank.rank >= lastRank) {
          lastRank = rank.rank;
          break;
        }
        lastRank = rank.rank;
        if (rank.rank <= 3) {
          achievements.push(
            `${this.describeRank(rank.rank)} ${this.comparisonField.description} ${this.activityType} ${period.description}`,
          );
        }
      }
    }

    return achievements;
  }

  private describeRank(rank: number): string {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈 2nd';
      case 3:
        return '🥉 3rd';
      default:
        return undefined;
    }
  }

  private rank<T extends RankableActivity>(
    activity: T,
    activities: T[],
    dateCutOff: Date,
    comparisonField: string,
  ): { rank: number; dateCutOff: Date } | undefined {
    const activitiesInPeriod = activities.filter(
      (a) => a.startDate >= dateCutOff,
    );
    if (activitiesInPeriod.length < 2) {
      return undefined;
    }
    this.logger.debug(
      `Ranking ${this.comparisonField.description} for activity ${this.activity.stravaId} with ${activitiesInPeriod.length} activities in period from ${dateCutOff.toISOString()}`,
    );
    const rank = activitiesInPeriod
      .sort((a, b) => b[comparisonField] - a[comparisonField])
      .findIndex((a) => a.stravaId === activity.stravaId);
    return {
      rank: rank + 1,
      dateCutOff,
    };
  }
}
