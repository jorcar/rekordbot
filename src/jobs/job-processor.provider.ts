import { Injectable, OnModuleInit, SetMetadata } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { JobsService } from './jobs.service';

export const JOB_PROCESSOR = 'JobProcessor';

export interface JobProcessorProvider<T> {
  processJob(job: T): Promise<void>;
}

export const JobProcessor = (queue_name: string) =>
  SetMetadata(JOB_PROCESSOR, queue_name);

@Injectable()
export class JobProcessorConfigurer implements OnModuleInit {
  constructor(
    private discovery: DiscoveryService,
    private jobsService: JobsService,
  ) {}

  async onModuleInit(): Promise<void> {
    const wrappers = this.discovery.getProviders();

    for (const wrapper of wrappers) {
      if (wrapper.metatype) {
        const metadata = Reflect.getMetadata(JOB_PROCESSOR, wrapper.metatype);
        if (metadata) {
          await this.jobsService.registerProcessor(
            metadata,
            wrapper.instance.processJob.bind(wrapper.instance),
          );
        }
      }
    }

    await this.jobsService.init();
  }
}
