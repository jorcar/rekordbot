import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { StravaAthlete } from './entities/strava-athlete.entity';
import { StravaCredentials } from './entities/strava-credentials.entity';
import {
  SimpleStravaApiActivity,
  StravaApiActivity,
  StravaApiService,
  StravaTokenResponse,
} from './strava-api.service';
import { JobEnqueuerService } from '../job/job-enqueuer.service';
import { STRAVA_ATHLETE_ADDED_JOB, StravaAthleteAddedJob } from './jobs/jobs';
import { ConfigService } from '@nestjs/config';
import { StravaConfig } from '../config/configuration';
import { TransactionRunner } from './transaction-runner.provider';
import {
  createCredentialsRecord,
  createStravaAthleteRecord,
} from './entities/entity-factory';

@Injectable()
export class StravaService {
  private readonly logger = new Logger(StravaService.name);
  private readonly webhookUrl: string;

  constructor(
    @InjectRepository(StravaAthlete)
    private athleteRepo: Repository<StravaAthlete>,
    @InjectRepository(StravaCredentials)
    private credentialsRepo: Repository<StravaCredentials>,
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
        stravaAthleteId: athlete.stravaId,
      },
    );
  }

  private async createAthlete(
    tokenResponse: StravaTokenResponse,
    userId: number,
  ): Promise<StravaAthlete> {
    return await this.transactionRunner.runInTransaction(async (manager) => {
      const stravaCredentials = createCredentialsRecord(tokenResponse);
      await manager.save(StravaCredentials, stravaCredentials);
      const stravaAthlete = createStravaAthleteRecord(
        tokenResponse,
        stravaCredentials,
        { id: userId } as User,
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
    const token = await this.getFreshTokenForStravaAthlete(stravaAthleteId);
    return await this.stravaApiService.getActivity(activity_id, token);
  }

  public async fetchActivities(
    stravaAthleteId: number,
    before: Date,
    page?: number,
    perPage?: number,
  ): Promise<SimpleStravaApiActivity[]> {
    const token = await this.getFreshTokenForStravaAthlete(stravaAthleteId);
    return await this.stravaApiService.getActivities(
      token,
      before,
      page,
      perPage,
    );
  }

  public async registerWebhook(stravaAthleteId: number) {
    try {
      const token = await this.getFreshTokenForStravaAthlete(stravaAthleteId);
      const subscriptionId =
        await this.stravaApiService.createWebhookSubscription(
          token,
          this.webhookUrl,
        );

      await this.athleteRepo.update(
        { stravaId: stravaAthleteId },
        { subscriptionId },
      );
    } catch (err) {
      this.logger.error('error registering webhook', err);
    }
  }

  async setDescription(
    stravaAthleteId: number,
    stravaActivityId: number,
    description: string,
  ): Promise<void> {
    const token = await this.getFreshTokenForStravaAthlete(stravaAthleteId);
    await this.stravaApiService.setDescription(
      stravaActivityId,
      description,
      token,
    );
  }

  private async getFreshTokenForStravaAthlete(
    stravaAthleteId: number,
  ): Promise<string> {
    const athlete = await this.athleteRepo.findOneOrFail({
      where: { stravaId: stravaAthleteId },
    });
    return await this.getFreshToken(athlete);
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
}
