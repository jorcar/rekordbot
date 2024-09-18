import { Injectable, Logger } from '@nestjs/common';
import { StravaActivity } from '../entities/strava-activity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { ActivityAchievementsAnalyzer } from './grouped-analyzers/activity-achievements-analyzer';
import { SegmentEffortsAnalyzer } from './grouped-analyzers/segment-efforts-analyzer';
import { AchievementEffortsAnalyzer } from './grouped-analyzers/achievement-efforts-analyzer';
import { RankedAchievement } from './grouped-analyzers/abstract-grouped-analyzer';

@Injectable()
export class ActivityAnalyzer {
  private readonly logger = new Logger(ActivityAnalyzer.name);

  // TODO: might make sense to encapsulate repo classes to not ripple db details all over

  constructor(
    private activityAchievementsAnalyzer: ActivityAchievementsAnalyzer,
    private segmentEffortsAnalyzer: SegmentEffortsAnalyzer,
    private achievementEffortsAnalyzer: AchievementEffortsAnalyzer,
  ) {}

  public async analyzeActivity(
    stravaActivity: StravaActivity,
  ): Promise<string[]> {
    this.logger.debug(`Analyzing activity ${stravaActivity.stravaId}`);

    const analyzers = [
      this.activityAchievementsAnalyzer,
      this.segmentEffortsAnalyzer,
      this.achievementEffortsAnalyzer,
    ];

    const twelveMonthsAgo = DateTime.fromJSDate(stravaActivity.startDate)
      .minus({ months: 12 })
      .toJSDate();

    const results: RankedAchievement[] = [];
    for (const analyzer of analyzers) {
      results.push(
        ...(await analyzer.analyze(stravaActivity, twelveMonthsAgo)),
      );
    }

    // now group all ranks by hash and pick the one with the best rank for each hash. then sort by rank in a list
    const resultsByHash = new Map<string, RankedAchievement>();
    for (const result of results) {
      const existingResult = resultsByHash.get(result.hash);
      if (!existingResult || existingResult.rank > result.rank) {
        resultsByHash.set(result.hash, result);
      }
    }

    return Array.from(resultsByHash.values())
      .sort((a, b) => a.rank - b.rank)
      .map((result) => result.description);
  }
}
