import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from './abstract-transactional.repository';
import { StravaActivity } from '../entities/strava-activity.entity';

export class StravaActivityRepository extends AbstractTransactionalRepository<
  StravaActivity,
  StravaActivityRepository
> {
  constructor(
    @InjectRepository(StravaActivity)
    repo: Repository<StravaActivity>,
  ) {
    super(repo, StravaActivityRepository);
  }

  public async saveActivity(athlete: StravaActivity): Promise<void> {
    await this.repo.save(athlete);
  }
}
