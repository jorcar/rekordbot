import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { StravaAthlete } from './entities/strava-athlete.entity';
import { StravaCredentials } from './entities/strava-credentials.entity';
import {
  StravaApiActivity,
  StravaApiService,
  StravaTokenResponse,
} from './strava-api.service';
import { UserService } from '../user/user.service';
import { StravaActivity } from './entities/strava-activity.entity';
import { StravaSegmentEffort } from './entities/strava-segment-effort.entity';
import { JobEnqueuerService } from '../job/job-enqueuer.service';
import { STRAVA_ATHLETE_ADDED_JOB, StravaAthleteAddedJob } from './jobs';
import { ConfigService } from '@nestjs/config';
import { StravaConfig } from '../config/configuration';
import { TransactionRunner } from './transaction-runner.provider';

@Injectable()
export class StravaService {
  private readonly logger = new Logger(StravaService.name);
  private readonly webhookUrl: string;

  constructor(
    @InjectRepository(StravaAthlete)
    private athleteRepo: Repository<StravaAthlete>,
    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
    @InjectRepository(StravaSegmentEffort)
    private segmentEffortsRepo: Repository<StravaSegmentEffort>,
    @InjectRepository(StravaCredentials)
    private credentialsRepo: Repository<StravaCredentials>,
    private userService: UserService,
    private stravaApiService: StravaApiService,
    private jobPublisher: JobEnqueuerService,
    private configService: ConfigService,
    private transactionRunner: TransactionRunner,
  ) {
    this.webhookUrl =
      this.configService.get<StravaConfig>('strava').webhook_url;
  }

  public async getAthleteForUser(
    user: User,
  ): Promise<StravaAthlete | undefined> {
    return this.athleteRepo.findOne({ where: { user } });
  }

  public async getAthleteStats(athleteId: number): Promise<any> {
    const activityCountPromise = this.activityRepo.count({
      where: { athlete: { id: athleteId } },
    });

    const segmentEffortCountPromise = this.segmentEffortsRepo.count({
      where: { athlete: { id: athleteId } },
    });
    const [activityCount, segmentEffortCount] = await Promise.all([
      activityCountPromise,
      segmentEffortCountPromise,
    ]);
    return { activityCount, segmentEffortCount };
  }

  public async exchangeToken(code: string, userId: number): Promise<void> {
    const res = await this.stravaApiService.exchangeToken(code);
    if (!res) {
      return;
    }
    const athlete = await this.createAthlete(res, userId);
    await this.jobPublisher.enqueue<StravaAthleteAddedJob>(
      STRAVA_ATHLETE_ADDED_JOB,
      {
        athleteId: athlete.id,
      },
    );
  }

  private async createAthlete(
    tokenResponse: StravaTokenResponse,
    userId: number,
  ): Promise<StravaAthlete> {
    return await this.transactionRunner.runInTransaction(async (manager) => {
      const user = await this.userService.findById(userId);
      const stravaCredentials = this.createCredentialsRecord(tokenResponse);
      await manager.save(StravaCredentials, stravaCredentials);
      const stravaAthlete = this.createStravaAthleteRecord(
        tokenResponse,
        stravaCredentials,
        user!,
      );
      await manager.save(StravaAthlete, stravaAthlete);
      this.logger.debug(`athlete added and linked:${tokenResponse.athlete.id}`);
      return stravaAthlete;
    });
  }

  public async fetchActivity(
    activity_id: number,
    stravaAthleteId: number,
  ): Promise<StravaApiActivity> {
    const athlete = await this.athleteRepo.findOneOrFail({
      where: { stravaId: stravaAthleteId },
    });
    const token = await this.getFreshToken(athlete);
    return await this.stravaApiService.getActivity(activity_id, token);
  }

  public async registerWebhook(athleteId: number) {
    try {
      const athlete = await this.athleteRepo.findOneOrFail({
        where: { id: athleteId },
      });
      const token = await this.getFreshToken(athlete);
      const subscriptionId =
        await this.stravaApiService.createWebhookSubscription(
          token,
          this.webhookUrl,
        );

      await this.athleteRepo.update(athleteId, { subscriptionId });
    } catch (err) {
      this.logger.error('error registering webhook', err);
    }
  }

  async setDescription(
    stravaAthleteId: number,
    stravaActivityId: number,
    description: string,
  ): Promise<void> {
    const athlete = await this.athleteRepo.findOneOrFail({
      where: { stravaId: stravaAthleteId },
    });
    const token = await this.getFreshToken(athlete);
    await this.stravaApiService.setDescription(
      stravaActivityId,
      description,
      token,
    );
  }

  public async refreshWebhook(userId: number) {
    const athlete = await this.athleteRepo.findOneOrFail({
      where: { user: { id: userId } as User },
    });
    const token = await this.getFreshToken(athlete);
    await this.stravaApiService.deleteWebhookSubscription(
      token,
      athlete.subscriptionId,
    );
    const subscriptionId =
      await this.stravaApiService.createWebhookSubscription(
        token,
        this.webhookUrl,
      );

    await this.athleteRepo.update(athlete.id, { subscriptionId });
  }

  private async getFreshToken(athlete: StravaAthlete): Promise<string> {
    const credentials = await athlete.credentials;
    let token = credentials.accessToken;
    if (credentials.tokenExpiresAt < new Date()) {
      this.logger.log('refreshing strava access token');
      const updated = await this.stravaApiService.refreshAccessToken(
        credentials.refreshToken,
      );
      await this.credentialsRepo.update(credentials.id, {
        accessToken: updated.access_token,
        refreshToken: updated.refresh_token,
        tokenExpiresAt: new Date(updated.expires_at * 1000),
      });
      token = updated.access_token;
    }
    return token;
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
