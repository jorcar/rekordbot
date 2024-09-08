import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UserService } from './user/user.service';
import { StravaService } from './strava/strava.service';

@Controller()
export class AppController {
  constructor(
    private userService: UserService,
    private stravaService: StravaService,
  ) {}

  @Get()
  @Render('index')
  index() {}

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
  async profile(@Req() request: any) {
    const user = await this.userService.findByEmail(request.user.user);
    const athlete = await this.stravaService.getAthleteForUser(user);
    const statistics = {
      activities: 0,
      segment_efforts: 0,
      achievements: 0,
    };
    return { athlete, user, statistics };
  }
}
