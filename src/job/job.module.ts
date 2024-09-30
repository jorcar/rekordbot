import { Global, Module } from '@nestjs/common';
import { JOB_PROCESSOR } from './job-processor';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './job.module-definition';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { JobEnqueuerService } from './job-enqueuer.service';
import { JobService } from './job.service';
import * as PgBoss from 'pg-boss';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    JobService,
    JobEnqueuerService,
    {
      provide: PgBoss,
      useFactory: (config: any) => {
        console.log('config', config);
        return new PgBoss({
          connectionString: config.connectionString,
          max: config.maxNumberConnections,
        });
      },
      inject: [MODULE_OPTIONS_TOKEN],
    },
  ],
  exports: [JobEnqueuerService],
})
export class JobModule extends ConfigurableModuleClass {
  constructor(
    private jobService: JobService,
    private discovery: DiscoveryService,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const wrappers = this.discovery.getProviders();
    await this.jobService.init();
    for (const wrapper of wrappers) {
      if (wrapper.metatype) {
        const metadata = Reflect.getMetadata(JOB_PROCESSOR, wrapper.metatype);
        if (metadata) {
          await this.jobService.registerProcessor(
            metadata,
            wrapper.instance.processJob.bind(wrapper.instance),
          );
        }
      }
    }
  }
}
