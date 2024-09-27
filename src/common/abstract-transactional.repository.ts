import { Repository } from 'typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

export class AbstractTransactionalRepository<
  EntityType,
  RepositoryClass,
> extends Repository<EntityType> {
  constructor(
    protected repo: Repository<EntityType>,
    private type: new (repository: Repository<EntityType>) => RepositoryClass,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  public transactional(entityManager: EntityManager): RepositoryClass {
    return new this.type(entityManager.getRepository(this.repo.target));
  }
}
