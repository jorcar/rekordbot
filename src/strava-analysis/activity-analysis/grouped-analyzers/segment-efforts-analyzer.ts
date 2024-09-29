import { StravaActivity } from '../../../strava/entities/strava-activity.entity';
import { StravaSegmentEffort } from '../../../strava/entities/strava-segment-effort.entity';
import { AbstractGroupedAnalyzer } from './abstract-grouped-analyzer';
import { StravaAthlete } from '../../../strava/entities/strava-athlete.entity';
import { describeRank } from '../rank-utils';
import { AnalysisParams } from '../period-analyzers/best-effort-in-period-analyzer';
import { StravaSegmentEffortRepository } from '../../../strava/repositories/strava-segment-effort.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SegmentEffortsAnalyzer extends AbstractGroupedAnalyzer<StravaSegmentEffort> {
  constructor(private segmentEffortRepository: StravaSegmentEffortRepository) {
    super();
  }

  getEfforts(activity: StravaActivity): Promise<StravaSegmentEffort[]> {
    return activity.segmentEfforts;
  }

  async getHistoricalEffortsForSameEntity(
    athlete: StravaAthlete,
    entity: StravaSegmentEffort,
    fromDate: Date,
  ): Promise<StravaSegmentEffort[]> {
    const segment = await entity.segment;
    return this.segmentEffortRepository.getEfforts(
      athlete,
      segment,
      fromDate,
      entity.startDate,
    );
  }

  getAnalysisParams(): AnalysisParams[] {
    return [
      {
        field: 'movingTime',
        order: 'smallest',
        rankDescriptionGenerator: this.generateRankDescription,
        hashGenerator: this.generateResultHash,
      },
    ];
  }

  async generateRankDescription(
    rank: number,
    entity: StravaSegmentEffort,
    periodDescription: string,
  ): Promise<string> {
    const segment = await entity.segment;
    return `${describeRank(rank)} fastest time on ${segment.name} ${periodDescription}`;
  }

  private async generateResultHash(
    rank: number,
    entity: StravaSegmentEffort,
  ): Promise<string> {
    const segment = await entity.segment;
    return `fastest-${segment.stravaId}-${rank}`;
  }
}
