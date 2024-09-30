import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthService } from './auth.service';
import { CookieService } from '../auth-utils/cookie.service';
import { PasswordHashService } from '../auth-utils/password-hash.service';
import { UserService } from '../user/user.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { when } from 'jest-when';
import { User } from '../user/user.entity';

describe('AuthController', () => {
  let app: NestExpressApplication;
  let authService: AuthService;
  let cookieService: CookieService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: CookieService, useValue: {} },
        { provide: PasswordHashService, useValue: {} },
        { provide: UserService, useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    authService = moduleRef.get<AuthService>(AuthService);
    authService.validateUser = jest.fn();
    cookieService = moduleRef.get<CookieService>(CookieService);
    cookieService.generateCookie = jest.fn();
    await app.init();
  });

  describe('POST /auth/login', () => {
    const user: User = {
      id: 1,
      email: 'someEmail',
      password: 'someName',
    };
    describe('when user is found', () => {
      const token = 'someToken';

      beforeEach(() => {
        when(authService.validateUser)
          .calledWith(user.email, user.password)
          .mockResolvedValue(user);
        when(cookieService.generateCookie)
          .calledWith(user)
          .mockResolvedValue({ token, cookie_options: {} });
      });
      it('should set a cookie with an access token', async () => {
        const resp = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: user.email, password: user.password })
          .expect(302)
          .expect('location', '/profile');
        expect(resp.header['set-cookie']).toEqual([`token=${token}; Path=/`]);
      });
    });
    describe('when user is not found', () => {
      beforeEach(() => {
        when(authService.validateUser)
          .calledWith(user.email, user.password)
          .mockResolvedValue(undefined);
      });
      it('should redirect to login with a specific code', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .field('email', user.email)
          .field('password', user.password)
          .expect(302)
          .expect('location', '/login?error=not_found');
      });
    });
  });

  describe('GET /auth/logout', () => {
    it('', async () => {
      const resp = await request(app.getHttpServer())
        .get('/auth/logout')
        .expect(302)
        .expect('location', '/');
      // check that cookie is cleared
      expect(resp.header['set-cookie']).toEqual(['token=; Path=/']);
    });
  });
});
