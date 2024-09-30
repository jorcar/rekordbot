import { Test } from '@nestjs/testing';
import { CookieService } from '../auth-utils/cookie.service';
import { User } from '../user/user.entity';
import { when } from 'jest-when';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;

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

    tokenService = moduleRef.get<TokenService>(TokenService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    jwtService.sign = jest.fn();
  });

  describe('generateToken', () => {
    const user: User = {
      id: 123,
      email: 'john@doe.net',
      password: 'hashed-pw',
    };
    beforeEach(() => {
      when(jwtService.sign)
        .calledWith({ user: user.email, sub: user.id })
        .mockResolvedValue('signed-token');
    });
    it('should return a signed  jwt token', async () => {
      expect(await tokenService.generateToken(user)).toEqual('signed-token');
    });
  });
});
