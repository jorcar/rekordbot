import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from '../../common/abstract-transactional.repository';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { StravaBackfillStatus } from '../entities/strava-backfill-status.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
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
