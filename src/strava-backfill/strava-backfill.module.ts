import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaModule } from '../strava/strava.module';
import { BackfillStatusRepository } from './backfill-status.repository';
import { Backfiller } from './backfill/backfiller';
import { ActivityBackfiller } from './backfill/activity-backfiller';
import { EffortBackfiller } from './backfill/effort-backfiller';
import { StravaBackfillStatus } from './strava-backfill-status.entity';
import { TransactionRunner } from '../common/transaction-runner.provider';
import { StravaBackfillService } from './strava-backfill.service';
import { StravaBackfillJobProcessor } from './strava-backfill.job-processor';
import { ThrottledScheduler } from '../strava/jobs/throttled-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([StravaBackfillStatus]), StravaModule],
  controllers: [],
  providers: [
    BackfillStatusRepository,
    Backfiller,
    ActivityBackfiller,
    EffortBackfiller,
    TransactionRunner,
    StravaBackfillService,
    StravaBackfillJobProcessor,
    ThrottledScheduler,
  ],
  exports: [StravaBackfillService],
})
export class StravaBackfillModule {}
