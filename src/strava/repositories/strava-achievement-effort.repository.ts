import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from './abstract-transactional.repository';
import { StravaAchievementEffort } from '../entities/strava-achievement-effort.entity';

export class StravaAchievementEffortRepository extends AbstractTransactionalRepository<
  StravaAchievementEffort,
  StravaAchievementEffortRepository
> {
  constructor(
    @InjectRepository(StravaAchievementEffort)
    repo: Repository<StravaAchievementEffort>,
  ) {
    super(repo, StravaAchievementEffortRepository);
  }

  public async saveAchievementEffort(
    effort: StravaAchievementEffort,
  ): Promise<void> {
    await this.repo.save(effort);
  }
}
