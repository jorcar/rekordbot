import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {}

  @Get('login')
  @Render('login')
  login() {}

  @Get('signup')
  @Render('signup')
  signup() {}

  @Get()
  @Render('profile')
  profile() {}
}
