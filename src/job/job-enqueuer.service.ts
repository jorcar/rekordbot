import { Injectable } from '@nestjs/common';
import { JobService } from './job.service';

@Injectable()
export class JobEnqueuerService {
  constructor(private jobService: JobService) {}

  async enqueue<T extends object>(queue: string, job: T, time?: Date) {
    await this.jobService.enqueue(queue, job, time);
  }
}
