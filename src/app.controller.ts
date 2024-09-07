import { Body, Controller, Get, Post, Render, Req, Res } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {}

  @Get('login')
  @Render('login')
  login() {}

  @Get('profile')
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
