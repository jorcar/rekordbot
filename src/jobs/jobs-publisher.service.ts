import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class JobsPublisherService {
  private readonly logger = new Logger(JobsPublisherService.name);

  constructor() {}

  public async enqueue(queue: string, message: any) {
    console.log('JobsPublisherService.enqueue()');
  }
}
