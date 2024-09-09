import {
  Controller,
  Get,
  Logger,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StravaService } from './strava.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auth/strava')
export class StravaAuthController {
  private readonly logger = new Logger(StravaAuthController.name);
  constructor(private stravaService: StravaService) {}

  private client_id = 27973;
  private client_secret = 'bfb397cb3618f6df91fa939456ce39f7864eb3ae';

  @Get()
  @UseGuards(JwtAuthGuard)
  @Redirect()
  getStravaUrl(@Req() request: any) {
    const userId = request.user.userId;
    // TODO: extract config
    const redirect_uri = `http://localhost:3000/auth/strava/callback?userId=${userId}`;
    const scope = 'activity:read_all,activity:write';

    const url = `https://www.strava.com/oauth/authorize?client_id=${this.client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&approval_prompt=force`;
    this.logger.debug(`redirecting user to Strava: ${userId}`);
    return { url };
  }

  @Get('callback')
  async stravaCallback(@Query() params: any, @Res() response: any) {
    const { code, error, userId } = params;

    if (error) {
      this.logger.log('error from strava', error);
      response.redirect('/profile');
      return;
    }

    await this.stravaService.exchangeToken(code, userId);
    response.redirect('/profile');
  }
}
