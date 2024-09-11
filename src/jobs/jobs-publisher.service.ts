import { Inject, Injectable, Logger } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Injectable()
export class JobsPublisherService {
  private readonly logger = new Logger(JobsPublisherService.name);

  constructor(@Inject() private jobsService: JobsService) {}

  public async enqueue(queue: string, message: any) {
    await this.jobsService.enqueue(queue, message);
  }
}
