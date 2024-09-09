import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaCredentials } from './strava-credentials.entity';

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    username: string;
    resource_state: number;
    firstname: string;
    lastname: string;
    city: string;
    state: string;
    country: string;
    profile: string;
  };
}

export interface StravaTokenResponseWithAthlete extends StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: Athlete;
}

export interface Athlete {
  id: number;
  username: string;
  resource_state: number;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  profile: string;
}

@Injectable()
export class StravaApiService {
  private readonly logger = new Logger(StravaApiService.name);
  // TODO: move to config
  private client_id = 27973;
  private client_secret = 'bfb397cb3618f6df91fa939456ce39f7864eb3ae'; //FIXME

  constructor(
    @InjectRepository(StravaAthlete)
    private credentialsRepo: Repository<StravaCredentials>,
  ) {}

  async exchangeToken(
    code: string,
  ): Promise<StravaTokenResponseWithAthlete | undefined> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: this.client_id.toString(),
        client_secret: this.client_secret,
        code,
        grant_type: 'authorization_code',
      }),
    });
    if (response.status !== 200) {
      this.logger.error(`error code from strava: ${response.status}`);
      return undefined;
    }
    return response.json();
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<StravaTokenResponse | undefined> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: this.client_id.toString(),
        client_secret: this.client_secret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (response.status !== 200) {
      this.logger.error(`error code from strava: ${response.status}`);
      return undefined;
    }
    return await response.json();
  }

  async createWebhookSubscription(
    token: string,
    webhook_url: string,
  ): Promise<number> {
    const response = await fetch(
      ' https://www.strava.com/api/v3/push_subscriptions ',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: new URLSearchParams({
          client_id: this.client_id.toString(),
          client_secret: this.client_secret,
          callback_url: webhook_url,
          verify_token: 'STRAVA',
        }),
      },
    );
    if (!response.ok) {
      this.logger.error(`error code from strava: ${response.status}`);
      throw new Error('error creating webhook subscription');
    }
    const data = await response.json();
    return data.id;
  }
}
