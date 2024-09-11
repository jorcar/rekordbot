import { DynamicModule, Global, Module } from '@nestjs/common';
import { JobService } from './job.service';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { JOB_PROCESSOR } from './job-processor';
import { JobEnqueuerService } from './job-enqueuer.service';

@Global()
@Module({})
export class JobModule {
  constructor(
    private jobService: JobService,
    private discovery: DiscoveryService,
  ) {
    console.log('JobQModule module constructor');
  }
  static forRoot(config: { connectionString: string }): DynamicModule {
    return {
      imports: [DiscoveryModule],
      module: JobModule,
      providers: [
        JobService,
        JobEnqueuerService,
        {
          provide: 'PG_BOSS_CONFIG',
          useValue: config,
        },
      ],
      exports: [JobEnqueuerService],
    };
  }

  async onModuleInit(): Promise<void> {
    const wrappers = this.discovery.getProviders();

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

    await this.jobService.init();
  }
}
