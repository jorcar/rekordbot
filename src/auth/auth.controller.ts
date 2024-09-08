import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from '../auth-utils/token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}
  @Post('login')
  async register(@Body() bo: any, @Res() res: any) {
    const email = bo.email.trim();
    const password = bo.password.trim(); // FIXME: hash!

    const validatedUser = await this.authService.validateUser(email, password);
    if (!validatedUser) {
      console.log('User does not exist');
      res.redirect('/login?error=not_found');
      return;
    }

    const token = await this.tokenService.generateToken(validatedUser);
    res.cookie('token', token);
    res.redirect('/profile');
  }
}
