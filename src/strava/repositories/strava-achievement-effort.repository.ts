import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from '../../common/abstract-transactional.repository';
import { StravaAchievementEffort } from '../entities/strava-achievement-effort.entity';
import { StravaAthlete } from '../entities/strava-athlete.entity';

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

  public async getAchievementEfforts(
    athlete: StravaAthlete,
    effortName: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<StravaAchievementEffort[]> {
    return this.repo.find({
      where: {
        effortName,
        athlete,
        startDate: Between(fromDate, toDate),
      },
      order: {
        startDate: 'DESC',
      },
    });
  }
}
