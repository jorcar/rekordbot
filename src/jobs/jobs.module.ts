import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { JobsPublisherService } from './jobs-publisher.service';
import { JobsService } from './jobs.service';

export class JobsModuleConfig {
  connectionString: string;
}

@Module({
  imports: [DiscoveryModule],
  providers: [
    {
      provide: 'PG_BOSS_CONFIG',
      useValue: {
        connectionString: 'postgres://postgres:@localhost:5432/my_database',
      },
    },
    JobsPublisherService,
    JobsService,
  ],
  exports: [JobsPublisherService],
})
export class JobsModule {
  /*  static forRoot(config: JobsModuleConfig): DynamicModule {
    console.log('JobsModule.forRoot()');
    return {
      imports: [DiscoveryModule],
      module: JobsModule,
      providers: [
        JobsService,
        { provide: 'PG_BOSS_CONFIG', useValue: config },
        JobsPublisherService,
      ],
      exports: [JobsPublisherService, JobsService],
    };
  }*/
}
