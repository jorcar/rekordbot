import { Inject, Injectable, Logger } from '@nestjs/common';
import * as PgBoss from 'pg-boss';
import { JobsModuleConfig } from './job-module-config';
import { MODULE_OPTIONS_TOKEN } from './job.module-definition';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  private boss: PgBoss;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private config: JobsModuleConfig) {
    this.boss = new PgBoss(this.config.connectionString);
  }
  public async init(): Promise<void> {
    await this.boss.start();
    this.boss.on('error', (error) => {
      this.logger.error('PgBoss error:', error);
    });
    this.boss.on('wip', (data) => {
      this.logger.debug('PgBoss processing job', data);
    });
  }

  public async registerProcessor(
    queue: string,
    handler: (job: any) => Promise<void>,
  ) {
    this.logger.debug(`Registering processor for queue ${queue}`);
    await this.boss.createQueue(queue);
    await this.boss.work(queue, async ([job]) => {
      try {
        await handler(job.data);
      } catch (error) {
        this.logger.error('Error processing job', error);
        throw error;
      }
    });
  }

  async enqueue<T extends object>(queue: string, job: T) {
    this.logger.log(`Publishing message to queue ${queue}`);
    await this.boss.createQueue(queue);
    await this.boss.send(queue, job);
  }
}
