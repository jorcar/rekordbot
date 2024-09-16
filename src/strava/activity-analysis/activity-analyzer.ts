import { Injectable, Logger } from '@nestjs/common';
import { StravaActivity } from '../entities/strava-activity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityAnalyzer {
  private readonly logger = new Logger(ActivityAnalyzer.name);

  constructor(
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
  ) {}
  public async analyzeActivity(stravaActivityId: bigint) {
    this.logger.debug(`Analyzing activity ${stravaActivityId}`);
    // TODO: might make sense to encapsulate repo class to not ripple db details all over
    const activity = await this.activityRepo.findOneOrFail({
      where: { stravaId: stravaActivityId },
    });
    // Analyze the activity here
    const athlete = await activity.athlete;
    // TODO: limit to last 12 months???
    const allActivitiesOfType = await this.activityRepo.find({
      where: {
        sportType: activity.sportType,
        athlete: athlete,
      },
      order: {
        startDate: 'DESC',
      },
    });

    this.logger.debug(
      `Found ${allActivitiesOfType.length} activities of type ${activity.sportType}`,
    );
  }
}

// activity efforts
// of same type:
// longest (distance)
// longest (time)
// most elevation
// anniversary (10, 15, 20, 25, 30, all days in a month)
// anniversary (20, 25, 30, 40 , 50 ,60 in the last 3 months)
// most activities in a month (last 12 months, last 9 months last 6 months)
// most activities in a week (last 12 months, last 9 months last 6 months, last 3 months)
