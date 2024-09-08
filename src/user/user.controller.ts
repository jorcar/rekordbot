import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CookieService } from '../auth-utils/cookie.service';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private cookieService: CookieService,
  ) {}
  @Post('register')
  async register(@Body() bo: any, @Res() res: any) {
    const email = bo.email.trim();
    const password = bo.password.trim();

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      res.redirect('/login');
      return;
    }

    const user = await this.userService.registerUser(email, password);
    const { token, cookie_options } =
      await this.cookieService.generateCookie(user);
    res.cookie('token', token, cookie_options);
    res.redirect('/profile');
  }
}
