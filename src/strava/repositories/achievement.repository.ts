import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from './abstract-transactional.repository';
import { StravaActivity } from '../entities/strava-activity.entity';
import { Achievement } from '../entities/achievement.entity';

export class AchievementRepository extends AbstractTransactionalRepository<
  Achievement,
  AchievementRepository
> {
  constructor(
    @InjectRepository(Achievement)
    repo: Repository<Achievement>,
  ) {
    super(repo, AchievementRepository);
  }

  public async deleteFor(activity: StravaActivity): Promise<void> {
    await this.repo.delete({ activity });
  }

  public async createAchievement(achievement: Achievement): Promise<void> {
    await this.repo.save(achievement);
  }
}
