import { SetMetadata } from '@nestjs/common';

export const JOB_PROCESSOR = 'JobProcessor';

export interface QueuedJobProcessor<T> {
  processJob(job: T): Promise<void>;
}

export const JobProcessor = (queue_name: string) =>
  SetMetadata(JOB_PROCESSOR, queue_name);
