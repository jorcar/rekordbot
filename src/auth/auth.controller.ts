import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CookieService } from '../auth-utils/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
  ) {}
  @Post('login')
  async register(@Body() bo: any, @Res() res: any) {
    const email = bo.email.trim();
    const password = bo.password.trim(); // FIXME: hash!

    const validatedUser = await this.authService.validateUser(email, password);
    if (!validatedUser) {
      res.redirect('/login?error=not_found');
      return;
    }

    const { token, cookie_options } =
      await this.cookieService.generateCookie(validatedUser);
    res.cookie('token', token, cookie_options);
    res.redirect('/profile');
  }

  @Get('logout')
  async logout(@Res() res: any) {
    res.cookie('token', '');
    res.redirect('/');
  }
}
