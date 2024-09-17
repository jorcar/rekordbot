import { Injectable, Logger } from '@nestjs/common';
import { StravaActivity } from '../entities/strava-activity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { FixedPeriodBestEffortAnalyzer } from './fixed-period-analyzer';
import { RelativePeriodBestEffortAnalyzer } from './relative-period-analyzer';

@Injectable()
export class ActivityAnalyzer {
  private readonly logger = new Logger(ActivityAnalyzer.name);

  constructor(
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
  ) {}

  public async analyzeActivity(stravaActivityId: number): Promise<string[]> {
    this.logger.debug(`Analyzing activity ${stravaActivityId}`);
    // TODO: might make sense to encapsulate repo class to not ripple db details all over
    const activity = await this.activityRepo.findOneOrFail({
      where: { stravaId: stravaActivityId },
    });
    // Analyze the activity here
    const athlete = await activity.athlete;
    // TODO: might make sense to encapsulate repo class to not ripple db details all over
    const twelveMonthsAgo = DateTime.fromJSDate(activity.startDate)
      .minus({ months: 12 })
      .toJSDate();
    const allActivitiesOfType = await this.activityRepo.find({
      where: {
        sportType: activity.sportType,
        athlete: athlete,
        startDate: Between(twelveMonthsAgo, activity.startDate),
      },
      order: {
        startDate: 'DESC',
      },
    });

    const analyzers = [
      new FixedPeriodBestEffortAnalyzer(activity, allActivitiesOfType, {
        field: 'distance',
        description: 'furthest',
        type: activity.sportType,
      }),
      new RelativePeriodBestEffortAnalyzer(activity, allActivitiesOfType, {
        field: 'distance',
        description: 'furthest',
        type: activity.sportType,
      }),
      new FixedPeriodBestEffortAnalyzer(activity, allActivitiesOfType, {
        field: 'movingTime',
        description: 'longest',
        type: activity.sportType,
      }),
      new RelativePeriodBestEffortAnalyzer(activity, allActivitiesOfType, {
        field: 'movingTime',
        description: 'longest',
        type: activity.sportType,
      }),
      new FixedPeriodBestEffortAnalyzer(activity, allActivitiesOfType, {
        field: 'totalElevationGain',
        description: 'most elevation gain',
        type: activity.sportType,
      }),
      new RelativePeriodBestEffortAnalyzer(activity, allActivitiesOfType, {
        field: 'totalElevationGain',
        description: 'most elevation gain',
        type: activity.sportType,
      }),
    ];

    const results = [];
    for (const analyzer of analyzers) {
      results.push(...analyzer.analyze());
    }
    console.log(results);
    return results;
    // in this "month"
  }
}

// activity efforts
// of same type:
// longest (distance)
// longest (moving time)
// most elevation
// anniversary (10, 15, 20, 25, 30, all days in a month)
// anniversary (20, 25, 30, 40 , 50 ,60 in the last 3 months)
// most activities in a month (last 12 months, last 9 months last 6 months)
// most activities in a week (last 12 months, last 9 months last 6 months, last 3 months)
