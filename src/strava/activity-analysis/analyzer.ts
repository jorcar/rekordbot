import { StravaActivity } from '../entities/strava-activity.entity';

export interface RankedAchievement {
  rank: number;
  description: string;
}

export interface Analyzer {
  analyze(
    activity: StravaActivity,
    fromDate: Date,
  ): Promise<RankedAchievement[]>;
}
