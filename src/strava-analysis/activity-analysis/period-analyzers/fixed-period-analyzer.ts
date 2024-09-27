import { DateTime } from 'luxon';
import {
  AnalysisParams,
  BestEffortInPeriodAnalyzer,
  RankableActivity,
} from './best-effort-in-period-analyzer';

export interface RankPeriod {
  cutoffDate: Date;
  description: string;
}

export class FixedPeriodBestEffortAnalyzer<
  T extends RankableActivity,
> extends BestEffortInPeriodAnalyzer<T> {
  constructor(activity: T, activities: T[], analysisParams: AnalysisParams) {
    super(activity, activities, analysisParams);
  }

  protected getPeriods(): RankPeriod[] {
    return [
      {
        cutoffDate: DateTime.fromJSDate(this.activity.startDate)
          .toUTC()
          .startOf('month')
          .toJSDate(),
        description: 'this month',
      },

      {
        cutoffDate: DateTime.fromJSDate(this.activity.startDate)
          .toUTC()
          .startOf('year')
          .toJSDate(),
        description: 'this year',
      },
    ];
  }
}
