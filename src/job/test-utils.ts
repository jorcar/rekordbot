import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule } from '@nestjs/core';
import { JobService } from './job.service';
import * as PgBoss from 'pg-boss';
import { JobEnqueuerService } from './job-enqueuer.service';
import { ThrottledScheduler } from './throttled-scheduler.service';

export async function createTestingModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [DiscoveryModule],
    controllers: [],
    providers: [
      JobService,
      JobEnqueuerService,
      ThrottledScheduler,
      {
        provide: PgBoss,
        useValue: jest.mock('pg-boss'),
      },
    ],
  }).compile();
}
