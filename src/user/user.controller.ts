import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenService } from '../auth-utils/token.service';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
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
    const token = await this.tokenService.generateToken(user);
    res.cookie('token', token);
    res.redirect('/profile');
  }
}
