import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaCredentials } from './strava-credentials.entity';
import {
  StravaApiActivity,
  StravaApiService,
  StravaTokenResponse,
} from './strava-api.service';
import { UserService } from '../user/user.service';
import { StravaActivity } from './strava-activity.entity';
import { StravaSegmentEffort } from './strava-segment-effort.entity';

@Injectable()
export class StravaService {
  private readonly logger = new Logger(StravaService.name);
  constructor(
    @InjectRepository(StravaAthlete)
    private athleteRepo: Repository<StravaAthlete>,

    @InjectRepository(StravaActivity)
    private activityRepo: Repository<StravaActivity>,
    @InjectRepository(StravaSegmentEffort)
    private segmentEfforsRepo: Repository<StravaSegmentEffort>,
    @InjectRepository(StravaCredentials)
    private credentialsRepo: Repository<StravaCredentials>,
    private dataSource: DataSource,
    private userService: UserService,
    private stravaApiService: StravaApiService,
    //private jobPublisher: JobsPublisherService,
  ) {}

  public async getAthleteForUser(
    user: User,
  ): Promise<StravaAthlete | undefined> {
    return this.athleteRepo.findOne({ where: { user } });
  }

  public async getAthleteStats(athleteId: number): Promise<any> {
    const activityCountPromise = this.activityRepo.count({
      where: { athlete: { id: athleteId } },
    });
    const segmentEfforCountPromis = this.segmentEfforsRepo.count({
      where: { athlete: { id: athleteId } },
    });
    const [activityCount, segmentEffortCount] = await Promise.all([
      activityCountPromise,
      segmentEfforCountPromis,
    ]);
    return { activityCount, segmentEffortCount };
  }

  public async exchangeToken(code: string, userId: number): Promise<void> {
    const res = await this.stravaApiService.exchangeToken(code);
    if (!res) {
      return;
    }
    await this.createAthlete(res, userId);
    /*await this.jobPublisher.enqueue(STRAVA_ATHLETE_ADDED_JOB, {
      athleteId: res.athlete.id,
    });*/
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

  public async fetchActivity(
    activity_id: number,
    stravaAthleteId: number,
  ): Promise<StravaApiActivity> {
    const athlete = await this.athleteRepo.findOne({
      where: { stravaId: stravaAthleteId },
    });
    if (!athlete) {
      this.logger.error(`athlete not found: ${stravaAthleteId}`);
      return;
    }

    const credentials = await athlete.credentials;
    let token = credentials.accessToken;
    if (credentials.tokenExpiresAt < new Date()) {
      this.logger.log('refreshing token');
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

    const activity = await this.stravaApiService.getActivity(
      activity_id,
      token,
    );
    return activity;
  }

  public async registerWebhook(athleteId: number) {
    const athlete = await this.athleteRepo.findOne({
      where: { id: athleteId },
    });
    if (!athlete) {
      this.logger.error(`athlete not found: ${athleteId}`);
      return;
    }
    const credentials = await athlete.credentials;
    const subscriptionId =
      await this.stravaApiService.createWebhookSubscription(
        credentials.accessToken,
        'https://46c7-90-225-125-107.ngrok-free.app/strava/webhook',
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
