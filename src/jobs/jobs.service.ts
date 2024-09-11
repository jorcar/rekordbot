import { Inject, Injectable, Logger } from '@nestjs/common';
import * as PgBoss from 'pg-boss';
import { JobsModuleConfig } from './jobs.module';
import { DiscoveryService } from '@nestjs/core';
import { JOB_PROCESSOR } from './job-processor';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private boss: PgBoss;

  constructor(
    @Inject('PG_BOSS_CONFIG') private config: JobsModuleConfig,
    private discovery: DiscoveryService,
  ) {
    console.log('JobsService constructor');
    this.boss = new PgBoss(config.connectionString);
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
    await this.boss.work(queue, handler);
  }

  async enqueue<T extends object>(queue: string, job: T) {
    this.logger.log(`Publishing message to queue ${queue}`);
    await this.boss.createQueue(queue);
    await this.boss.send(queue, job);
  }

  async onModuleInit(): Promise<void> {
    const wrappers = this.discovery.getProviders();

    for (const wrapper of wrappers) {
      if (wrapper.metatype) {
        const metadata = Reflect.getMetadata(JOB_PROCESSOR, wrapper.metatype);
        if (metadata) {
          await this.registerProcessor(
            metadata,
            wrapper.instance.processJob.bind(wrapper.instance),
          );
        }
      }
    }

    await this.init();
  }
}
