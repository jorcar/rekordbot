import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

@Injectable()
export class TransactionRunner {
  constructor(private dataSource: DataSource) {}

  async runInTransaction<T>(
    fn: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await fn(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
