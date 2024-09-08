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
import { DataSource } from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaCredentials } from './strava-credentials.entity';
import { StravaService, StravaTokenResponse } from './strava.service';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auth/strava')
export class StravaAuthController {
  private readonly logger = new Logger(StravaAuthController.name);
  constructor(
    private dataSource: DataSource,
    private stravaService: StravaService,
  ) {}

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

    const res = await this.stravaService.exchangeToken(code);
    if (!res) {
      this.logger.error('error exchanging token');
      response.redirect('/profile');
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //FIXME: this should be a service
      const user = await queryRunner.manager.findOneOrFail(User, {
        where: { id: userId },
      });
      const stravaCredentials = this.createCredentials(res);
      await queryRunner.manager.save(StravaCredentials, stravaCredentials);
      const stravaAthlete = this.createAthlete(res, stravaCredentials, user);
      await queryRunner.manager.save(StravaAthlete, stravaAthlete);
      await queryRunner.commitTransaction();
      this.logger.debug(`athlete added and linked:${res.athlete.id}`);
      // TODO: trigger some kind of event to trigger backfill and webhook setup
      // TODO: redirect somewhere
      response.redirect('/profile');
    } catch (err) {
      this.logger.error('error saving athlete', err);
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      response.redirect('/profile');
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  private createAthlete(
    res: StravaTokenResponse,
    stravaCredentials: StravaCredentials,
    user: User,
  ) {
    const stravaAthlete = new StravaAthlete();
    stravaAthlete.stravaId = res.athlete.id;
    stravaAthlete.firstName = res.athlete.firstname;
    stravaAthlete.lastName = res.athlete.lastname;
    stravaAthlete.profileUrl = res.athlete.profile;
    stravaAthlete.credentials = Promise.resolve(stravaCredentials);
    stravaAthlete.user = Promise.resolve(user);
    return stravaAthlete;
  }

  private createCredentials(res: StravaTokenResponse) {
    const stravaCredentials: StravaCredentials = new StravaCredentials();
    stravaCredentials.accessToken = res.access_token;
    stravaCredentials.refreshToken = res.refresh_token;
    stravaCredentials.tokenExpiresAt = new Date(res.expires_at * 1000);
    return stravaCredentials;
  }
}
