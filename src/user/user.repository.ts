import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { AbstractTransactionalRepository } from '../common/abstract-transactional.repository';

export class UserRepository extends AbstractTransactionalRepository<
  User,
  UserRepository
> {
  constructor(
    @InjectRepository(User)
    repo: Repository<User>,
  ) {
    super(repo, UserRepository);
  }

  public async saveUser(user: User): Promise<User> {
    return await this.repo.save(user);
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return await this.repo.findOne({ where: { email } });
  }
}
