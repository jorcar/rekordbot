import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractTransactionalRepository } from '../../common/abstract-transactional.repository';
import { StravaSegment } from '../entities/strava-segment.entity';

export class StravaSegmentRepository extends AbstractTransactionalRepository<
  StravaSegment,
  StravaSegmentRepository
> {
  constructor(
    @InjectRepository(StravaSegment) repo: Repository<StravaSegment>,
  ) {
    super(repo, StravaSegmentRepository);
  }

  public async saveSegment(segment: StravaSegment): Promise<void> {
    await this.repo.save(segment);
  }

  public async findSegment(
    stravaId: string,
  ): Promise<StravaSegment | undefined> {
    return await this.repo.findOne({
      where: { stravaId },
    });
  }
}
