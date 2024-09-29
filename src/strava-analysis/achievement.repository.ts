import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from '../common/abstract-transactional.repository';
import { StravaActivity } from '../strava/entities/strava-activity.entity';
import { Achievement } from './achievement.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
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

  public async countAchievementsForAthlete(athleteId: number): Promise<number> {
    return this.repo.count({
      where: { athlete: { id: athleteId } },
    });
  }
}
