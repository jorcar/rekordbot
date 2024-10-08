import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import {
  STRAVA_ACTIVITY_ANALYSIS_JOB,
  STRAVA_ACTIVITY_UPDATED_JOB,
  StravaActivityAnalysisJob,
  StravaActivityUpdatedJob,
} from '../../jobs';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';
import { TransactionRunner } from '../../common/transaction-runner.provider';
import { StravaActivityRepository } from '../repositories/strava-activity.repository';
import { StravaService } from '../strava.service';
import { ActivityEffortsCreationService } from '../activity-efforts-creation.service';
import { StravaAthleteRepository } from '../repositories/strava-athlete.repository';
import { StravaApiActivity } from '../strava-api.service';
import { createStravaActivityRecord } from '../entities/entity-factory';
import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

@JobProcessor(STRAVA_ACTIVITY_UPDATED_JOB)
export class StravaActivityUpdatedJobProcessor
  implements QueuedJobProcessor<StravaActivityUpdatedJob>
{
  private readonly logger = new Logger(StravaActivityUpdatedJobProcessor.name);
  constructor(
    private jobEnqueuer: JobEnqueuerService,
    private transactionRunner: TransactionRunner,
    private stravaActivityRepository: StravaActivityRepository,
    private stravaService: StravaService,
    private activityEffortsCreationService: ActivityEffortsCreationService,
    private stravaAthleteRepository: StravaAthleteRepository,
  ) {}

  async processJob(job: StravaActivityUpdatedJob): Promise<void> {
    await this.transactionRunner.runInTransaction(async (manager) => {
      // TODO: potentially lock on the strava id to prevent duplicate processing
      if (!job.updates) {
        this.logger.log('Creating Strava activity');
        await this.createActivity(job, manager);
      } else {
        const existingActivity = await this.stravaActivityRepository
          .transactional(manager)
          .findOptionalActivity(job.stravaActivityId);
        if (!existingActivity) {
          this.logger.log(
            'Got an activity update, but activity does not exist. Creating Strava activity',
          );
          await this.createActivity(job, manager);
        } else {
          if (job.updates?.type) {
            this.logger.log('Activity type has changed, processing changes');
            await this.stravaActivityRepository.deleteActivity(
              job.stravaActivityId,
            );
            await this.createActivity(job, manager);
          }
        }
      }
    });
  }

  private async createActivity(
    job: StravaActivityUpdatedJob,
    manager: EntityManager,
  ) {
    const activity = await this.stravaService.fetchActivity(
      job.stravaActivityId,
      job.stravaAthleteId,
    );
    this.logger.debug(`Found activity on Strava ${activity.id}`);
    await this.storeActivity(activity, job.stravaAthleteId, manager);
    await this.jobEnqueuer.enqueue<StravaActivityAnalysisJob>(
      STRAVA_ACTIVITY_ANALYSIS_JOB,
      {
        stravaActivityId: job.stravaActivityId,
        stravaAthleteId: job.stravaAthleteId,
      },
    );
  }

  private async storeActivity(
    activity: StravaApiActivity,
    stravaAthleteId: number,
    manager: EntityManager,
  ) {
    const athlete =
      await this.stravaAthleteRepository.findAthleteByStravaId(stravaAthleteId);
    this.logger.debug(`Saving activity for athlete ${athlete.id}`);
    const stravaActivity = createStravaActivityRecord(activity, athlete);
    await this.stravaActivityRepository
      .transactional(manager)
      .saveActivity(stravaActivity);

    await this.activityEffortsCreationService.extractAndCreateEfforts(
      athlete,
      activity,
      stravaActivity,
      manager,
    );
  }
}
