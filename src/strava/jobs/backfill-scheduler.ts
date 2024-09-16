import { Injectable, Logger } from '@nestjs/common';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';

// in a environment with multiple instances lastEnqueued would need to be shared between instances (db + locking)
@Injectable()
export class BackfillScheduler {
  private readonly throttleMs = 15 * 60 * 1000;

  private logger = new Logger(BackfillScheduler.name);

  private lastEnqueued?: Date;

  constructor(private jobEnqueuer: JobEnqueuerService) {}

  public async enqueueThrottled(queue: string, job: object) {
    if (!this.lastEnqueued) {
      const now = new Date();
      // TODO: truncate to nearest passed 0, 15, 30, 45 minute
      this.lastEnqueued = now;
      this.logger.debug(`Enqueuing job ${queue} at ${now.toISOString()}`);
      await this.jobEnqueuer.enqueue(queue, job); // TODO: add some kind of hash as singleton key
      return;
    }
    const nextEnqueue = new Date(this.lastEnqueued.getTime() + this.throttleMs);
    this.logger.debug(`Enqueuing job ${queue} at ${nextEnqueue.toISOString()}`);
    await this.jobEnqueuer.enqueue(queue, job, nextEnqueue); // TODO: add some kind of hash as singleton key
    this.lastEnqueued = nextEnqueue;
  }
}
