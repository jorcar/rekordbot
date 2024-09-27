import { Between, DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from './abstract-transactional.repository';
import { StravaActivity } from '../entities/strava-activity.entity';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { StravaSegment } from '../entities/strava-segment.entity';
import { StravaSegmentEffort } from '../entities/strava-segment-effort.entity';
import { StravaBackfillStatus } from '../entities/strava-backfill-status.entity';

export class BackfillStatusRepository extends AbstractTransactionalRepository<
  StravaBackfillStatus,
  BackfillStatusRepository
> {
  constructor(
    @InjectRepository(StravaBackfillStatus)
    repo: Repository<StravaBackfillStatus>,
  ) {
    super(repo, BackfillStatusRepository);
  }

  public async saveStatus(status: StravaBackfillStatus): Promise<void> {
    await this.repo.save(status);
  }

  public async findByAthlete(
    athlete: StravaAthlete,
  ): Promise<StravaBackfillStatus | undefined> {
    return await this.repo.findOne({ where: { athlete } });
  }

  public async updateStatus(
    id: number,
    entity: DeepPartial<StravaBackfillStatus>,
  ): Promise<void> {
    await this.repo.update({ id }, entity);
  }
}
