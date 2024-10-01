import { TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { createTestingModule } from './test-utils';

describe('UserRepository', () => {
  let app: NestExpressApplication;
  let moduleRef: TestingModule;
  let userRepo: UserRepository;

  beforeAll(async () => {
    moduleRef = await createTestingModule();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    userRepo = moduleRef.get<UserRepository>(UserRepository);
  });

  describe('findByEmail', () => {
    describe('when user does not exist', () => {
      it('should return undefined', async () => {
        const user = await userRepo.findByEmail('someEmail');
        expect(user).toBeNull();
      });
    });
    describe('when user exists', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        user.email = crypto.randomUUID();
        user.password = 'password';
        await userRepo.save(user);
      });
      it('should return undefined', async () => {
        const storedUser = await userRepo.findByEmail(user.email);
        expect(storedUser).toEqual(user);
      });
    });
  });
});
