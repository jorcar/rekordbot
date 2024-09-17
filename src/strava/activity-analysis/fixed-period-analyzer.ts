import { DateTime } from 'luxon';
import {
  BestEffortAnalyzer,
  FieldDescription,
  RankableActivity,
} from './best-effort-analyzer';

export interface RankPeriod {
  cutoffDate: Date;
  description: string;
}

export class FixedPeriodBestEffortAnalyzer<
  T extends RankableActivity,
> extends BestEffortAnalyzer<T> {
  constructor(activity: T, activities: T[], comparisonField: FieldDescription) {
    super(activity, activities, comparisonField);
  }

  protected createRankPeriods(): RankPeriod[] {
    return [
      {
        cutoffDate: DateTime.utc().startOf('month').toJSDate(),
        description: 'this month',
      },

      {
        cutoffDate: DateTime.utc().startOf('year').toJSDate(),
        description: 'this year',
      },
    ];
  }
}
