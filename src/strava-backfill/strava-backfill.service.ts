import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StravaBackfillStatus } from './strava-backfill-status.entity';

export interface OnboardingStatus {
  activitiesSynched: boolean;
  segmentEffortsSynched: boolean;
  activity_percentage: number;
  segment_effort_percentage: number;
}

@Injectable()
export class StravaBackfillService {
  private readonly logger = new Logger(StravaBackfillService.name);

  constructor(
    @InjectRepository(StravaBackfillStatus)
    private backfillStatusRepository: Repository<StravaBackfillStatus>,
  ) {}

  public async getOnboardingStatus(
    atheleteId: number,
  ): Promise<OnboardingStatus | undefined> {
    const backfillStatus = await this.backfillStatusRepository.findOne({
      where: { athlete: { id: atheleteId } },
    });
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
          (backfillStatus.progress.processedPages * 200)) *
          100,
      ),
    };
  }
}
