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
