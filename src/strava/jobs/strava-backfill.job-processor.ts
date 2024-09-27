import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import { STRAVA_BACKFILL_JOB, StravaBackfillJob } from '../../jobs';
import { StravaBackfillStatus } from '../entities/strava-backfill-status.entity';
import { Logger } from '@nestjs/common';
import { StravaAthlete } from '../entities/strava-athlete.entity';
import { ThrottledScheduler } from './throttled-scheduler.service';
import { DateTime } from 'luxon';
import { StravaAthleteRepository } from '../repositories/strava-athlete.repository';
import { BackfillStatusRepository } from '../repositories/backfill-status.repository';
import { Backfiller } from '../backfill/backfiller';

@JobProcessor(STRAVA_BACKFILL_JOB)
export class StravaBackfillJobProcessor
  implements QueuedJobProcessor<StravaBackfillJob>
{
  private readonly logger = new Logger(StravaBackfillJobProcessor.name);
  constructor(
    private backfillScheduler: ThrottledScheduler,
    private backfillStatusRepository: BackfillStatusRepository,
    private athleteRepository: StravaAthleteRepository,
    private backfiller: Backfiller,
  ) {}

  async processJob(job: StravaBackfillJob): Promise<void> {
    this.logger.log(`Backfilling data for athlete ${job.athleteId}`);
    const athlete = await this.athleteRepository.findAthleteById(job.athleteId);
    const backfillStatus = await this.findOrCreateBackfillStatus(athlete);
    const done = await this.backfiller.backfill(backfillStatus);
    if (done) {
      this.logger.log('Backfill complete, removing job');
    } else {
      this.logger.log('Backfill not complete, rescheduling job');
      await this.backfillScheduler.enqueueThrottled('strava-backfill', {
        athleteId: job.athleteId,
      });
    }
  }

  private async findOrCreateBackfillStatus(
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
}
