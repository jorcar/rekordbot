import { Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { TokenService } from './token.service';

@Injectable()
export class CookieService {
  constructor(private tokenService: TokenService) {}

  async generateCookie(
    user: User,
  ): Promise<{ token: string; cookie_options: any }> {
    const token = await this.tokenService.generateToken(user);
    return {
      token,
      cookie_options: {
        httpOnly: true,
        expires: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      },
    };
  }
}
