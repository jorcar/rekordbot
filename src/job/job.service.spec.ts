import { JobService } from './job.service';
import * as PgBoss from 'pg-boss';
import { default_retry_options } from './job-module-config';
import { createTestingModule } from './test-utils';

describe('JobService', () => {
  let jobService: JobService;
  let pgBoss: PgBoss;

  beforeEach(async () => {
    const app = await createTestingModule();

    jobService = app.get<JobService>(JobService);
    pgBoss = app.get<PgBoss>(PgBoss);
  });

  describe('init', () => {
    beforeEach(() => {
      pgBoss.start = jest.fn();
    });
    it('should start pg-boss', async () => {
      await jobService.init();
      expect(pgBoss.start).toHaveBeenCalled();
    });
  });

  describe('registerProcessor', () => {
    const queue = 'queue';
    const handler = async () => {};
    beforeEach(() => {
      pgBoss.createQueue = jest.fn();
      pgBoss.updateQueue = jest.fn();
      pgBoss.work = jest.fn();
    });
    it('should create a queue', async () => {
      await jobService.registerProcessor(queue, handler);
      expect(pgBoss.createQueue).toHaveBeenCalledWith(queue);
    });
    it('should configure the queue', async () => {
      await jobService.registerProcessor(queue, handler);
      expect(pgBoss.updateQueue).toHaveBeenCalledWith(queue, {
        name: queue,
        ...default_retry_options,
      });
    });
    it('should start working on the queue', async () => {
      await jobService.registerProcessor(queue, handler);
      expect(pgBoss.work).toHaveBeenCalledWith(queue, expect.any(Function));
    });
  });

  describe('enqueue', () => {
    const queue = 'queue';
    const data = { data: 'data' };
    beforeEach(() => {
      pgBoss.send = jest.fn();
    });
    describe('not providing a specific timestamp', () => {
      it('should send message to queue', async () => {
        await jobService.enqueue(queue, data);
        expect(pgBoss.send).toHaveBeenCalledWith(queue, data);
      });
    });
    describe('providing a specific timestamp', () => {
      it('should send message to queue, specifying a process date', async () => {
        const timestamp = new Date();
        await jobService.enqueue(queue, data, timestamp);
        expect(pgBoss.send).toHaveBeenCalledWith(queue, data, {
          startAfter: timestamp,
        });
      });
    });
  });
});
