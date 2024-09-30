import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    app.createNestApplication();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      //expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
