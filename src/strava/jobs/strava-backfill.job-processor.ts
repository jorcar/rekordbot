import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import { StravaService } from '../strava.service';
import { STRAVA_BACKFILL_JOB, StravaBackfillJob } from './jobs';
import { TransactionRunner } from '../transaction-runner.provider';
import { StravaBackfillStatus } from '../entities/strava-backfill-status.entity';
import { Logger } from '@nestjs/common';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { ThrottledScheduler } from './throttled-scheduler.service';
import { SimpleStravaApiActivity } from '../strava-api.service';
import { createStravaActivityRecord } from '../entities/entity-factory';
import { ActivityEffortsCreationService } from './activity-efforts-creation.service';
import { DateTime } from 'luxon';
import { StravaAthleteRepository } from '../repositories/strava-athlete.repository';
import { BackfillStatusRepository } from '../repositories/backfill-status.repository';
import { StravaActivityRepository } from '../repositories/strava-activity.repository';

const FIFTEEN_MINUTE_BUDGET = 9;

@JobProcessor(STRAVA_BACKFILL_JOB)
export class StravaBackfillJobProcessor
  implements QueuedJobProcessor<StravaBackfillJob>
{
  private readonly logger = new Logger(StravaBackfillJobProcessor.name);
  constructor(
    private stravaService: StravaService,
    private transactionRunner: TransactionRunner,
    private backfillScheduler: ThrottledScheduler,
    private backfillStatusRepository: BackfillStatusRepository,
    private athleteRepository: StravaAthleteRepository,
    private stravaActivityRepository: StravaActivityRepository,
    private activityEffortCreationService: ActivityEffortsCreationService,
  ) {}

  async processJob(job: StravaBackfillJob): Promise<void> {
    this.logger.log(`Backfilling data for athlete ${job.athleteId}`);
    const athlete = await this.athleteRepository.findAthleteById(job.athleteId);
    const backfillStatus = await this.findOrCreteBackfillStatus(athlete);

    let budget = FIFTEEN_MINUTE_BUDGET;
    if (!backfillStatus.progress.activitiesSynched) {
      const { remainingBudget, done } = await this.backfillActivities(
        backfillStatus,
        athlete,
      );
      budget = remainingBudget;
      if (!done || budget == 0) {
        this.logger.log(
          'Activities not finished, or budget consumed - scheduling next backfill',
        );
        await this.backfillScheduler.enqueueThrottled('strava-backfill', {
          athleteId: job.athleteId,
        });
        return;
      }
    }
    if (!backfillStatus.progress.segmentEffortsSynched) {
      let done = false;
      while (budget > 0) {
        done = await this.transactionRunner.runInTransaction(
          async (manager) => {
            const index = isNaN(
              backfillStatus.progress.lastProcessedActivityIdx,
            )
              ? 0
              : backfillStatus.progress.lastProcessedActivityIdx + 1;

            const activity = await this.stravaActivityRepository
              .transactional(manager)
              .findNthActivityForAthlete(athlete, index);

            backfillStatus.progress.lastProcessedActivityIdx = index;
            backfillStatus.updatedAt = new Date();
            await this.backfillStatusRepository
              .transactional(manager)
              .saveStatus(backfillStatus);
            if (!activity) {
              this.logger.log('No activity found, backfill complete!');
              backfillStatus.progress.segmentEffortsSynched = true;
              await this.backfillStatusRepository
                .transactional(manager)
                .saveStatus(backfillStatus);
              return true;
            } else {
              this.logger.log(`Processing activity ${activity.stravaId}`);
              const stravaActivity = await this.stravaService.fetchActivity(
                activity.stravaId,
                athlete.stravaId,
              );
              budget--;
              await this.activityEffortCreationService.extractAndCreateEfforts(
                athlete,
                stravaActivity,
                activity,
                manager,
              );
            }
            return false;
          },
        );
      }
      if (!done) {
        this.logger.log(
          'Budget consumed backfilling efforts - scheduling next backfill',
        );
        await this.backfillScheduler.enqueueThrottled('strava-backfill', {
          athleteId: job.athleteId,
        });
      }
    }
  }

  private async backfillActivities(
    backfillStatus: StravaBackfillStatus,
    athlete: StravaAthlete,
  ) {
    this.logger.log('Backfilling activities');
    let done = false;
    let budget = 5;
    while (!done && budget > 0) {
      this.logger.log(
        `Backfilling activities: budget: ${budget}, done: ${done}`,
      );
      await this.transactionRunner.runInTransaction(async (manager) => {
        done = await this.backfillPageOfActivities(
          athlete,
          manager,
          backfillStatus,
        );
        budget--;
        if (done) {
          backfillStatus.progress.activitiesSynched = true;
        }
        backfillStatus.progress.processedPages += 1;
        backfillStatus.updatedAt = new Date();
        await this.backfillStatusRepository
          .transactional(manager)
          .saveStatus(backfillStatus);
        this.logger.log(
          `Processed page ${backfillStatus.progress.processedPages}`,
        );
        this.logger.log(JSON.stringify(backfillStatus.progress));
      });
    }
    if (!done) {
      this.logger.log('Activities not finished, but budget consumed');
    }
    return { done, remainingBudget: budget };
  }

  private async findOrCreteBackfillStatus(
    athlete: StravaAthlete,
  ): Promise<StravaBackfillStatus> {
    let backfillStatus =
      await this.backfillStatusRepository.findByAthlete(athlete);

    if (!backfillStatus) {
      const now = new Date();
      this.logger.log('Creating backfill status entry');
      backfillStatus = new StravaBackfillStatus();
      backfillStatus.athlete = Promise.resolve(athlete);
      backfillStatus.progress = {
        activitiesSynched: false,
        segmentEffortsSynched: false,
        synchUntil: now.toISOString(),
        synchCutOff: DateTime.fromJSDate(now).minus({ days: 365 }).toISO(),
        processedPages: 0,
      };
      backfillStatus.createdAt = now;
      backfillStatus.updatedAt = now;
      await this.backfillStatusRepository.saveStatus(backfillStatus);
    }
    return backfillStatus;
  }

  private async backfillPageOfActivities(
    athlete: StravaAthlete,
    manager: EntityManager,
    backfillStatus: StravaBackfillStatus,
  ) {
    const activities = await this.stravaService.fetchActivities(
      athlete.stravaId,
      new Date(backfillStatus.progress.synchUntil),
      backfillStatus.progress.processedPages + 1,
      200,
    );
    await this.createActivities(activities, athlete, manager);
    return (
      activities.length < 200 ||
      activities[activities.length - 1].start_date <
        backfillStatus.progress.synchCutOff
    );
  }

  private async createActivities(
    activities: SimpleStravaApiActivity[],
    athlete: StravaAthlete,
    manager: EntityManager,
  ) {
    for (const activity of activities) {
      await this.stravaActivityRepository
        .transactional(manager)
        .saveActivity(createStravaActivityRecord(activity, athlete));
    }
  }
}
