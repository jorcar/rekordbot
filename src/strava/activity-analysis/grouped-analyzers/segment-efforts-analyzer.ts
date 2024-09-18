import { StravaActivity } from '../../entities/strava-activity.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StravaSegmentEffort } from '../../entities/strava-segment-effort.entity';
import { AbstractGroupedAnalyzer } from './abstract-grouped-analyzer';
import { StravaAthlete } from '../../entities/strava-athlete.entity';
import { describeRank } from '../rank-utils';
import { AnalysisParams } from '../period-analyzers/best-effort-in-period-analyzer';

export class SegmentEffortsAnalyzer extends AbstractGroupedAnalyzer<StravaSegmentEffort> {
  constructor(
    @InjectRepository(StravaSegmentEffort)
    private segmentEffortRepository: Repository<StravaSegmentEffort>,
  ) {
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
    return this.segmentEffortRepository.find({
      where: {
        segment: { id: segment.id },
        athlete,
        startDate: Between(fromDate, entity.startDate),
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  getAnalysisParams(): AnalysisParams[] {
    return [
      {
        field: 'movingTime',
        order: 'smallest',
        rankDescriptionGenerator: this.generateRankDescription,
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
}
