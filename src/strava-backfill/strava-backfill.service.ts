import { Injectable, Logger } from '@nestjs/common';
import { BackfillStatusRepository } from './backfill-status.repository';
import { Athlete } from '../strava/strava-api.service';
import { StravaAthlete } from '../strava/entities/strava-athlete.entity';
import { ACTIVITIES_PER_PAGE } from './backfill/activity-backfiller';

export interface OnboardingStatus {
  activitiesSynched: boolean;
  segmentEffortsSynched: boolean;
  activity_percentage: number;
  segment_effort_percentage: number;
}

@Injectable()
export class StravaBackfillService {
  private readonly logger = new Logger(StravaBackfillService.name);

  constructor(private backfillStatusRepository: BackfillStatusRepository) {}

  public async getOnboardingStatus(
    atheleteId: number,
  ): Promise<OnboardingStatus | undefined> {
    const backfillStatus = await this.backfillStatusRepository.findByAthlete({
      id: atheleteId,
    } as StravaAthlete);
    if (!backfillStatus) {
      return undefined;
    }
    return {
      activitiesSynched: backfillStatus.progress.activitiesSynched,
      segmentEffortsSynched: backfillStatus.progress.segmentEffortsSynched,
      activity_percentage: backfillStatus.progress.activitiesSynched
        ? 100
        : Math.round(
            (backfillStatus.progress.processedPages /
              (backfillStatus.progress.processedPages + 2)) *
              100,
          ),
      segment_effort_percentage: Math.round(
        ((backfillStatus.progress.lastProcessedActivityIdx || 0) /
          (backfillStatus.progress.processedPages * ACTIVITIES_PER_PAGE)) *
          100,
      ),
    };
  }
}
