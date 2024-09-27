import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from './abstract-transactional.repository';
import { StravaSegmentEffort } from '../entities/strava-segment-effort.entity';

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
}
