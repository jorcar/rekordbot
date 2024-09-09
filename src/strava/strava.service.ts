import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaCredentials } from './strava-credentials.entity';
import { StravaApiService, StravaTokenResponse } from './strava-api.service';
import { UserService } from '../user/user.service';

@Injectable()
export class StravaService {
  private readonly logger = new Logger(StravaService.name);
  constructor(
    @InjectRepository(StravaAthlete)
    private athleteRepo: Repository<StravaAthlete>,
    private dataSource: DataSource,
    private userService: UserService,
    private stravaApiService: StravaApiService,
  ) {}

  public async getAthleteForUser(
    user: User,
  ): Promise<StravaAthlete | undefined> {
    return this.athleteRepo.findOne({ where: { user } });
  }

  public async exchangeToken(code: string, userId: number): Promise<void> {
    const res = await this.stravaApiService.exchangeToken(code);
    if (!res) {
      return;
    }
    await this.createAthlete(res, userId);
    // TODO: trigger some kind of event to trigger backfill and webhook setup
  }

  private async createAthlete(
    tokenResponse: StravaTokenResponse,
    userId: number,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userService.findById(userId);
      const stravaCredentials = this.createCredentialsRecord(tokenResponse);
      await queryRunner.manager.save(StravaCredentials, stravaCredentials);
      const stravaAthlete = this.createStravaAthleteRecord(
        tokenResponse,
        stravaCredentials,
        user!,
      );
      await queryRunner.manager.save(StravaAthlete, stravaAthlete);
      await queryRunner.commitTransaction();
      this.logger.debug(`athlete added and linked:${tokenResponse.athlete.id}`);
    } catch (err) {
      this.logger.error('error saving athlete', err);
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  public async registerWebhook(userId: number, athleteId: number) {
    const user = await this.userService.findById(userId);
    const athlete = await this.athleteRepo.findOne({
      where: { user },
    });
    if (!athlete) {
      this.logger.error(`athlete not found: ${athleteId}`);
      return;
    }
    const credentials = await athlete.credentials;
    const subscriptionId =
      await this.stravaApiService.createWebhookSubscription(
        credentials.accessToken,
        'http://localhost:3000/strava/webhook',
      );

    await this.athleteRepo.update(athlete.id, { subscriptionId });
  }

  private createStravaAthleteRecord(
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

  private createCredentialsRecord(res: StravaTokenResponse) {
    const stravaCredentials: StravaCredentials = new StravaCredentials();
    stravaCredentials.accessToken = res.access_token;
    stravaCredentials.refreshToken = res.refresh_token;
    stravaCredentials.tokenExpiresAt = new Date(res.expires_at * 1000);
    return stravaCredentials;
  }
}
