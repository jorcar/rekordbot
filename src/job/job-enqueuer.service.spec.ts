import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { JobEnqueuerService } from './job-enqueuer.service';
import { MODULE_OPTIONS_TOKEN } from './job.module-definition';

describe('JobEnqueuerService', () => {
  let jobEnqueuerService: JobEnqueuerService;
  let jobService: JobService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        JobEnqueuerService,
        JobService,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: {
            connectionString: '',
            maxNumberConnections: 5,
          },
        },
      ],
    }).compile();

    jobEnqueuerService = app.get<JobEnqueuerService>(JobEnqueuerService);
    jobService = app.get<JobService>(JobService);
  });

  describe('enqueue', () => {
    const queue = 'queue';
    const data = { data: 'data' };
    beforeEach(() => {
      jest.spyOn(jobService, 'enqueue').mockImplementation();
    });
    describe('not providing a specific timestamp', () => {
      it('should all job service to enqueue job', async () => {
        await jobEnqueuerService.enqueue(queue, data);
        expect(jobService.enqueue).toHaveBeenCalledWith(queue, data, undefined);
      });
    });
    describe('providing a specific timestamp', () => {
      let timestamp: Date;
      beforeEach(() => {
        timestamp = new Date();
      });
      it('should all job service to enqueue job', async () => {
        await jobEnqueuerService.enqueue('queue', { data: 'data' }, timestamp);
        expect(jobService.enqueue).toHaveBeenCalledWith(queue, data, timestamp);
      });
    });
  });
});
