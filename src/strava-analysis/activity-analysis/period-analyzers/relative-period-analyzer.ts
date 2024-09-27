import { DateTime } from 'luxon';
import {
  AnalysisParams,
  BestEffortInPeriodAnalyzer,
  RankableActivity,
  RankPeriod,
} from './best-effort-in-period-analyzer';

export class RelativePeriodBestEffortAnalyzer<
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
          .minus({ months: 3 })
          .toJSDate(),
        description: 'in the last 3 months',
      },

      {
        cutoffDate: DateTime.fromJSDate(this.activity.startDate)
          .toUTC()
          .minus({ months: 6 })
          .toJSDate(),
        description: 'in the last 6 months',
      },

      {
        cutoffDate: DateTime.fromJSDate(this.activity.startDate)
          .toUTC()
          .minus({ months: 12 })
          .toJSDate(),
        description: 'in the last 12 months',
      },
    ];
  }
}
