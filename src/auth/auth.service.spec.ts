import { AuthController } from './auth.controller';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CookieService } from '../auth-utils/cookie.service';
import { PasswordHashService } from '../auth-utils/password-hash.service';
import { UserService } from '../user/user.service';
import autoMockOn = jest.autoMockOn;
import { User } from '../user/user.entity';
import { when } from 'jest-when';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let passwordHashService: PasswordHashService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: CookieService, useValue: autoMockOn() },
        { provide: PasswordHashService, useValue: autoMockOn() },
        { provide: UserService, useValue: autoMockOn() },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
    userService.findByEmail = jest.fn();

    passwordHashService =
      moduleRef.get<PasswordHashService>(PasswordHashService);
    passwordHashService.comparePasswords = jest.fn();
  });

  describe('validateUser', () => {
    describe('when user with email exists', () => {
      const providedPassword = 'password';
      const user: User = {
        id: 123,
        email: 'john@doe.net',
        password: 'hashed-pw',
      };
      beforeEach(() => {
        when(userService.findByEmail)
          .calledWith(user.email)
          .mockResolvedValue(user);
      });
      describe('when password is correct', () => {
        beforeEach(() => {
          when(passwordHashService.comparePasswords)
            .calledWith(providedPassword, user.password)
            .mockResolvedValue(true);
        });
        it('should return the User', async () => {
          expect(
            await service.validateUser(user.email, providedPassword),
          ).toEqual(user);
        });
      });
      describe('when password is incorrect', () => {
        beforeEach(() => {
          when(passwordHashService.comparePasswords)
            .calledWith(providedPassword, user.password)
            .mockResolvedValue(false);
        });
        it('should return undefined', async () => {
          expect(
            await service.validateUser('john@doe.net', 'changeme'),
          ).toEqual(undefined);
        });
      });
    });
    describe('when user with email does not exist', () => {
      beforeEach(() => {
        when(userService.findByEmail).mockResolvedValue(undefined);
      });
      it('should return undefined', async () => {
        expect(await service.validateUser('john@doe.net', 'changeme')).toEqual(
          undefined,
        );
      });
    });
  });
});
