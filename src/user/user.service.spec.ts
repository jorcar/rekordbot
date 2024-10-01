import { TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { when } from 'jest-when';
import { PasswordHashService } from '../auth-utils/password-hash.service';
import { createTestingModule } from './test-utils';

describe('UserService', () => {
  let app: NestExpressApplication;
  let moduleRef: TestingModule;
  let userService: UserService;
  let userRepo: UserRepository;
  let passwordHashService: PasswordHashService;

  beforeAll(async () => {
    moduleRef = await createTestingModule();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    userService = moduleRef.get<UserService>(UserService);
    userRepo = moduleRef.get<UserRepository>(UserRepository);
    userRepo.findByEmail = jest.fn();
    userRepo.saveUser = jest.fn();
    passwordHashService =
      moduleRef.get<PasswordHashService>(PasswordHashService);
    passwordHashService.hashPassword = jest.fn();
  });

  describe('findByEmail', () => {
    const user: User = {
      id: 123,
      email: 'someEmail',
      password: 'hashed-pw',
    };

    beforeEach(() => {
      when(userRepo.findByEmail).calledWith(user.email).mockResolvedValue(user);
    });

    it('should return whatever the repository returns', async () => {
      const returnedUser = await userService.findByEmail(user.email);
      expect(returnedUser).toEqual(user);
    });
  });

  describe('registerUser', () => {
    const email = 'someEmail';
    const password = 'somePassword';
    const hashedPassword = 'someHashedPassword';
    let createdUser: User;

    describe('when user with email does not already exist', () => {
      beforeEach(() => {
        when(userRepo.findByEmail)
          .calledWith(email)
          .mockResolvedValue(undefined);

        createdUser = new User();
        createdUser.email = email;
        createdUser.password = hashedPassword;
        when(userRepo.saveUser).mockResolvedValue(createdUser);

        when(passwordHashService.hashPassword)
          .calledWith(password)
          .mockResolvedValue(hashedPassword);
      });

      it('should store the user with hashed password', async () => {
        const returnedUser = await userService.registerUser(email, password);
        expect(returnedUser).toBeDefined();
        expect(returnedUser.email).toEqual(email);
        expect(returnedUser.password).toEqual(hashedPassword);
      });
    });
    describe('when user with email already exists', () => {
      beforeEach(() => {
        const existingUser = new User();
        existingUser.email = email;
        existingUser.password = hashedPassword;
        when(userRepo.findByEmail)
          .calledWith(email)
          .mockResolvedValue(existingUser);
      });

      it('should return undefined', async () => {
        const returnedUser = await userService.registerUser(email, password);
        expect(returnedUser).toBeUndefined();
      });
    });
  });
});
