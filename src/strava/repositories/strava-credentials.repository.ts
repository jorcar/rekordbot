import { StravaCredentials } from '../entities/strava-credentials.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from '../../common/abstract-transactional.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StravaCredentialsRepository extends AbstractTransactionalRepository<
  StravaCredentials,
  StravaCredentialsRepository
> {
  constructor(
    @InjectRepository(StravaCredentials) repo: Repository<StravaCredentials>,
  ) {
    super(repo, StravaCredentialsRepository);
  }

  public async saveCredentials(credentials: StravaCredentials): Promise<void> {
    await this.repo.save(credentials);
  }

  public async updateCredentials(
    id: number,
    credentials: DeepPartial<StravaCredentials>,
  ): Promise<void> {
    await this.repo.update(id, credentials);
  }
}
