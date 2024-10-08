import { Injectable, Logger } from '@nestjs/common';
import * as PgBoss from 'pg-boss';
import { default_retry_options } from './job-module-config';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(private boss: PgBoss) {}

  public async init(): Promise<void> {
    this.logger.log('Starting job service');
    await this.boss.start();
  }

  public async registerProcessor(
    queue: string,
    handler: (job: any) => Promise<void>,
  ) {
    this.logger.debug(`Registering processor for queue ${queue}`);
    await this.boss.createQueue(queue);
    await this.boss.updateQueue(queue, {
      name: queue,
      ...default_retry_options,
    });
    await this.boss.work(queue, async ([job]) => {
      try {
        await handler(job.data);
      } catch (error) {
        this.logger.error('Error processing job', error);
        throw error;
      }
    });
  }

  async enqueue<T extends object>(queue: string, job: T, timestamp?: Date) {
    this.logger.log(`Publishing message to queue ${queue}`);
    if (timestamp) {
      await this.boss.send(queue, job, { startAfter: timestamp });
      return;
    }
    await this.boss.send(queue, job);
  }
}
