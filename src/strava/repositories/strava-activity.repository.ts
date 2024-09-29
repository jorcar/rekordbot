import { Between, DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from '../../common/abstract-transactional.repository';
import { StravaActivity } from '../entities/strava-activity.entity';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
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

  public async findActivitiesOfType(
    athlete: StravaAthlete,
    sportType: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<StravaActivity[]> {
    return await this.repo.find({
      where: {
        sportType,
        athlete: athlete,
        startDate: Between(fromDate, toDate),
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  public async findNthActivityForAthlete(
    athlete: StravaAthlete,
    skip: number,
  ): Promise<StravaActivity | undefined> {
    const [activity] = await this.repo.find({
      where: { athlete },
      order: { stravaId: 'DESC' },
      take: 1,
      skip,
    });
    return activity;
  }
}
