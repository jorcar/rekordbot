import { DateTime } from 'luxon';
import {
  BestEffortAnalyzer,
  FieldDescription,
  RankableActivity,
  RankPeriod,
} from './best-effort-analyzer';

export class RelativePeriodBestEffortAnalyzer<
  T extends RankableActivity,
> extends BestEffortAnalyzer<T> {
  constructor(activity: T, activities: T[], comparisonField: FieldDescription) {
    super(activity, activities, comparisonField);
  }

  protected createRankPeriods(): RankPeriod[] {
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
