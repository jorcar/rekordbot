import { StravaBackfillStatus } from '../entities/strava-backfill-status.entity';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { TransactionRunner } from '../../common/transaction-runner.provider';
import { BackfillStatusRepository } from '../repositories/backfill-status.repository';
import { EffortBackfiller } from './effort-backfiller';
import { ActivityBackfiller } from './activity-backfiller';
import { Injectable, Logger } from '@nestjs/common';

const FIFTEEN_MINUTE_BUDGET = 9;

@Injectable()
export class Backfiller {
  private readonly logger = new Logger(Backfiller.name);

  constructor(
    private activityBackfiller: ActivityBackfiller,
    private segmentEffortBackfiller: EffortBackfiller,
    private transactionRunner: TransactionRunner,
    private backfillStatusRepository: BackfillStatusRepository,
  ) {}

  public async backfill(
    backfillStatus: StravaBackfillStatus,
  ): Promise<boolean> {
    let budget = FIFTEEN_MINUTE_BUDGET;
    while (budget > 0) {
      const nextStep = this.getNextStep(backfillStatus);
      if (!nextStep) {
        this.logger.log('Backfill complete, returning');
        return true;
      }
      budget--;

      await this.transactionRunner.runInTransaction(async (manager) => {
        await nextStep.backfill(backfillStatus, manager);
        await this.backfillStatusRepository
          .transactional(manager)
          .saveStatus(backfillStatus);
      });
    }
    return false;
  }

  private getNextStep(
    status: StravaBackfillStatus,
  ): PartialBackfiller | undefined {
    if (!status.progress.activitiesSynched) {
      return this.activityBackfiller;
    }
    if (!status.progress.segmentEffortsSynched) {
      return this.segmentEffortBackfiller;
    }
    return undefined;
  }
}

export interface PartialBackfiller {
  backfill(
    backfillStatus: StravaBackfillStatus,
    entityManager: EntityManager,
  ): Promise<void>;
}
