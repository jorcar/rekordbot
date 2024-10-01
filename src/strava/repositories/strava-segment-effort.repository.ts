import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from '../../common/abstract-transactional.repository';
import { StravaSegmentEffort } from '../entities/strava-segment-effort.entity';
import { StravaSegment } from '../entities/strava-segment.entity';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StravaSegmentEffortRepository extends AbstractTransactionalRepository<
  StravaSegmentEffort,
  StravaSegmentEffortRepository
> {
  constructor(
    @InjectRepository(StravaSegmentEffort)
    repo: Repository<StravaSegmentEffort>,
  ) {
    super(repo, StravaSegmentEffortRepository);
  }

  public async saveSegmentEffort(effort: StravaSegmentEffort): Promise<void> {
    await this.repo.save(effort);
  }

  public async getEfforts(
    athlete: StravaAthlete,
    segment: StravaSegment,
    fromDate: Date,
    toDate: Date,
  ): Promise<StravaSegmentEffort[]> {
    return this.repo.find({
      where: {
        segment,
        athlete,
        startDate: Between(fromDate, toDate),
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  public async countEffortsForAthlete(athlete: StravaAthlete): Promise<number> {
    return this.repo.count({
      where: { athlete },
    });
  }

  public async countSegmentsForAthlete(
    athlete: StravaAthlete,
  ): Promise<number> {
    const [count] = await this.repo.query(
      'SELECT COUNT(DISTINCT "segmentId") FROM strava_segment_effort WHERE "athleteId" = $1',
      [athlete.stravaId],
    );
    return count.count;
  }
}
