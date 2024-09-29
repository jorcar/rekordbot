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
}
