import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { User } from '../../user/user.entity';
import { AbstractTransactionalRepository } from './abstract-transactional.repository';

export class StravaAthleteRepository extends AbstractTransactionalRepository<
  StravaAthlete,
  StravaAthleteRepository
> {
  constructor(
    @InjectRepository(StravaAthlete)
    repo: Repository<StravaAthlete>,
  ) {
    super(repo, StravaAthleteRepository);
  }

  public async saveAthlete(athlete: StravaAthlete): Promise<void> {
    await this.repo.save(athlete);
  }

  public async findAthleteByStravaId(
    stravaAthleteId: number,
  ): Promise<StravaAthlete> {
    return await this.repo.findOneOrFail({
      where: { stravaId: stravaAthleteId },
    });
  }

  public async findAthleteById(id: number): Promise<StravaAthlete> {
    return await this.repo.findOneOrFail({
      where: { id },
    });
  }

  public async updateAthlete(
    stravaAthleteId: number,
    entity: DeepPartial<StravaAthlete>,
  ): Promise<void> {
    await this.repo.update({ stravaId: stravaAthleteId }, entity);
  }

  public async findAthleteForUser(
    user: User,
  ): Promise<StravaAthlete | undefined> {
    return this.repo.findOne({ where: { user } });
  }
}
