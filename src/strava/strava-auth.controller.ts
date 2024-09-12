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
import { ConfigService } from '@nestjs/config';
import { StravaConfig } from '../config/configuration';

@Controller('auth/strava')
export class StravaAuthController {
  private readonly logger = new Logger(StravaAuthController.name);
  private readonly client_id: number;
  private readonly oauth_redirect_uri: string;

  constructor(
    private stravaService: StravaService,
    private configService: ConfigService,
  ) {
    const config = this.configService.get<StravaConfig>('strava');
    this.client_id = config.client_id;
    this.oauth_redirect_uri = config.oauth_redirect_uri;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Redirect()
  getStravaUrl(
    @Req()
    request: any,
  ) {
    const userId = request.user.userId;
    const redirect_uri = `${this.oauth_redirect_uri}?userId=${userId}`;
    const scope = 'activity:read_all,activity:write';

    const url = `https://www.strava.com/oauth/authorize?client_id=${this.client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&approval_prompt=force`;
    this.logger.debug(`redirecting user to Strava: ${userId}`);
    return { url };
  }

  @Get('callback')
  async stravaCallback(
    @Query()
    params: any,
    @Res()
    response: any,
  ) {
    const { code, error, userId } = params;

    if (error) {
      this.logger.log('error from strava', error);
      response.redirect('/profile');
      return;
    }

    await this.stravaService.exchangeToken(code, userId);
    response.redirect('/profile');
  }

  @Get('reset-webhook')
  @UseGuards(JwtAuthGuard)
  async resetWebhook(
    @Req()
    request: any,
  ) {
    const userId = request.user.userId;
    await this.stravaService.refreshWebhook(userId);
  }
}
