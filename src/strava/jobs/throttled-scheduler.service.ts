import { Injectable, Logger } from '@nestjs/common';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';

// TODO: we should consider where this lives
// in a environment with multiple instances lastEnqueued would need to be shared between instances (db + locking)
@Injectable()
export class ThrottledScheduler {
  private readonly throttleMs = 15 * 60 * 1000;

  private logger = new Logger(ThrottledScheduler.name);

  private lastEnqueued?: Date;

  constructor(private jobEnqueuer: JobEnqueuerService) {}

  public async enqueueThrottled(queue: string, job: object) {
    if (!this.lastEnqueued) {
      this.lastEnqueued = this.truncateToNearestQuarter(new Date());
      this.logger.debug(
        `Enqueuing job ${queue} at ${this.lastEnqueued.toISOString()}`,
      );
      await this.jobEnqueuer.enqueue(queue, job); // TODO: add some kind of hash as singleton key
      return;
    }
    const nextEnqueue = new Date(this.lastEnqueued.getTime() + this.throttleMs);
    this.logger.debug(`Enqueuing job ${queue} at ${nextEnqueue.toISOString()}`);
    await this.jobEnqueuer.enqueue(queue, job, nextEnqueue); // TODO: add some kind of hash as singleton key
    this.lastEnqueued = nextEnqueue;
  }

  private truncateToNearestQuarter(date): Date {
    const minutes = date.getMinutes();
    const quarterMinutes = Math.floor(minutes / 15) * 15; // Nearest passed 0, 15, 30, 45
    date.setMinutes(quarterMinutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
}
