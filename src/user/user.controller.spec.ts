import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CookieService } from '../auth-utils/cookie.service';
import { UserService } from './user.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { when } from 'jest-when';
import { User } from './user.entity';
import { createTestingModule } from './test-utils';

describe('UserController', () => {
  let app: NestExpressApplication;
  let moduleRef: TestingModule;
  let userService: UserService;
  let cookieService: CookieService;

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
    userService.findByEmail = jest.fn();
    userService.registerUser = jest.fn();
    cookieService = moduleRef.get<CookieService>(CookieService);
    cookieService.generateCookie = jest.fn();
  });

  describe('POST /users/register', () => {
    const user: User = {
      id: 1,
      email: 'someEmail',
      password: 'someName',
    };
    describe('when user with email does not exist', () => {
      const token = 'someToken';

      beforeEach(() => {
        when(userService.findByEmail)
          .calledWith(user.email)
          .mockResolvedValue(undefined);
        when(userService.registerUser)
          .calledWith(user.email, user.password)
          .mockResolvedValue(user);

        when(cookieService.generateCookie)
          .calledWith(user)
          .mockResolvedValue({ token, cookie_options: {} });
      });
      it('should register the user, set a cookie with an access token and redirect to the profile page', async () => {
        const resp = await request(app.getHttpServer())
          .post('/users/register')
          .send({ email: user.email, password: user.password })
          .expect(302)
          .expect('location', '/profile');
        expect(resp.header['set-cookie']).toEqual([`token=${token}; Path=/`]);
      });
    });

    describe('when user with email already exists', () => {
      beforeEach(() => {
        when(userService.findByEmail)
          .calledWith(user.email)
          .mockResolvedValue(user);
      });
      it('should redirect to the login page', async () => {
        await request(app.getHttpServer())
          .post('/users/register')
          .send({ email: user.email, password: user.password })
          .expect(302)
          .expect('location', '/login');
      });
    });
  });
});
