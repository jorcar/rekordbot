import { Injectable, Logger } from '@nestjs/common';
import { StravaActivity } from '../entities/strava-activity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { ActivityAchievementsAnalyzer } from './activity-achievements-analyzer';
import { SegmentEffortsAnalyzer } from './segment-efforts-analyzer';
import { AchievementEffortsAnalyzer } from './achievement-efforts-analyzer';

@Injectable()
export class ActivityAnalyzer {
  private readonly logger = new Logger(ActivityAnalyzer.name);

  // TODO: might make sense to encapsulate repo classes to not ripple db details all over

  constructor(
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
    // TODO: figure out how to get these injected as an array of analyzers
    private activityAchievementsAnalyzer: ActivityAchievementsAnalyzer,
    private segmentEffortsAnalyzer: SegmentEffortsAnalyzer,
    private achievementEffortsAnalyzer: AchievementEffortsAnalyzer,
  ) {}

  public async analyzeActivity(stravaActivityId: number): Promise<string[]> {
    this.logger.debug(`Analyzing activity ${stravaActivityId}`);
    const activity = await this.activityRepo.findOneOrFail({
      where: { stravaId: stravaActivityId },
    });

    const analyzers = [
      this.activityAchievementsAnalyzer,
      this.segmentEffortsAnalyzer,
      this.achievementEffortsAnalyzer,
    ];

    const twelveMonthsAgo = DateTime.fromJSDate(activity.startDate)
      .minus({ months: 12 })
      .toJSDate();

    const results = [];
    for (const analyzer of analyzers) {
      results.push(...(await analyzer.analyze(activity, twelveMonthsAgo)));
    }

    return results;
  }
}
