import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {}

  @Get('login')
  @Render('login')
  login(@Req() req: any) {
    const { error } = req.query;
    if (error && error === 'not_found') {
      return {
        error: 'We could not log you in using that password. Please try again.',
      };
    }
    return { error };
  }

  @Get('signup')
  @Render('signup')
  signup() {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @Render('profile')
  profile() {}

  @Post('register')
  register(@Body() bo: any, @Res() res: any) {
    console.log('User created');
    console.log(bo);
    res.cookie('user', 'asdfg');
    res.redirect('/profile');
  }
}
