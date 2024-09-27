import { DeepPartial, Repository } from 'typeorm';
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

  public async saveActivity(activity: StravaActivity): Promise<void> {
    await this.repo.save(activity);
  }

  public async deleteActivity(stravaActivityId: number): Promise<void> {
    await this.repo.delete({ stravaId: stravaActivityId });
  }

  public async updateActivity(
    stravaActivityId: number,
    entity: DeepPartial<StravaActivity>,
  ): Promise<void> {
    await this.repo.update({ stravaId: stravaActivityId }, entity);
  }

  public async findActivity(stravaActivityId: number): Promise<StravaActivity> {
    return await this.repo.findOneOrFail({
      where: { stravaId: stravaActivityId },
    });
  }
}
