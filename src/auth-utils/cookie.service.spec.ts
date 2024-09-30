import { Test } from '@nestjs/testing';
import { CookieService } from '../auth-utils/cookie.service';
import { User } from '../user/user.entity';
import { when } from 'jest-when';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

describe('CookieService', () => {
  let service: CookieService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],

      providers: [
        CookieService,
        TokenService,
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get<CookieService>(CookieService);
    tokenService = moduleRef.get<TokenService>(TokenService);
    tokenService.generateToken = jest.fn();
  });

  describe('generateCookie', () => {
    const user: User = {
      id: 123,
      email: 'john@doe.net',
      password: 'hashed-pw',
    };
    beforeEach(() => {
      when(tokenService.generateToken)
        .calledWith(user)
        .mockResolvedValue('token');
    });
    it('should generate cookie data', async () => {
      expect(await service.generateCookie(user)).toEqual({
        token: 'token',
        cookie_options: {
          httpOnly: true,
          expires: expect.any(Date),
        },
      });
    });
  });
});
