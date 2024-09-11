import { DynamicModule, Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsPublisherService } from './jobs-publisher.service';
import { DiscoveryModule } from '@nestjs/core';
import { JobProcessorConfigurer } from './job-processor.provider';

export class JobsModuleConfig {
  connectionString: string;
}

@Module({})
export class JobsModule {
  static forRoot(config: JobsModuleConfig): DynamicModule {
    console.log('JobsModule.forRoot()');
    return {
      imports: [DiscoveryModule],
      module: JobsModule,
      providers: [
        JobsService,
        JobProcessorConfigurer,
        { provide: 'PG_BOSS_CONFIG', useValue: config },
        JobsPublisherService,
      ],
      exports: [JobsPublisherService],
    };
  }
}
