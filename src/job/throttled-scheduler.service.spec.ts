import { JobEnqueuerService } from './job-enqueuer.service';
import { createTestingModule } from './test-utils';
import { ThrottledScheduler } from './throttled-scheduler.service';

describe('JobEnqueuerService', () => {
  let jobEnqueuerService: JobEnqueuerService;
  let throttledScheduler: ThrottledScheduler;

  beforeEach(async () => {
    const app = await createTestingModule();

    jobEnqueuerService = app.get<JobEnqueuerService>(JobEnqueuerService);
    throttledScheduler = app.get<ThrottledScheduler>(ThrottledScheduler);
  });

  describe('enqueueThrottled', () => {
    const queue = 'queue';
    const data = { data: 'data' };
    beforeEach(() => {
      jest.spyOn(jobEnqueuerService, 'enqueue').mockImplementation();
    });
    describe('in the first invocation', () => {
      it('should call job service to enqueue job', async () => {
        await throttledScheduler.enqueueThrottled(queue, data);
        expect(jobEnqueuerService.enqueue).toHaveBeenCalledWith(queue, data);
      });
    });
    describe('in subsequent invocations', () => {
      beforeEach(async () => {
        await throttledScheduler.enqueueThrottled('something', data);
      });
      it('should call job service to enqueue job', async () => {
        await throttledScheduler.enqueueThrottled(queue, data);
        expect(jobEnqueuerService.enqueue).toHaveBeenCalledWith(
          queue,
          data,
          expect.any(Date),
        );
      });
    });
  });
});
