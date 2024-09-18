import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StravaConfig } from '../config/configuration';
import * as json_bigint from 'json-bigint';

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

export interface StravaApiActivity extends SimpleStravaApiActivity {
  segment_efforts?: any[];
  best_efforts?: any[];
}

export interface SimpleStravaApiActivity {
  id: number;
  description?: string;
  name: string;
  distance: number; // meters
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number; // meters
  type: string;
  start_date: string;
}

@Injectable()
export class StravaApiService {
  private readonly logger = new Logger(StravaApiService.name);
  private readonly client_id: number;
  private readonly client_secret: string;

  constructor(private configService: ConfigService) {
    const config = this.configService.get<StravaConfig>('strava');
    this.client_id = config.client_id;
    this.client_secret = config.client_secret;
  }

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

  async getActivity(
    activityId: number,
    token: string,
  ): Promise<StravaApiActivity> {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      this.logger.error(`error code from strava: ${response.status}`);
      throw new Error('error fetching activity');
    }
    return json_bigint.parse(await response.text()); // to not loose precision on bigints
  }

  async getActivities(
    token: string,
    before: Date,
    page: number = 1,
    perPage: number = 200,
  ): Promise<SimpleStravaApiActivity[]> {
    this.logger.debug(
      `fetching activities for page ${page},  ${before.toISOString()}, ${perPage}`,
    );
    const epoch = Math.round(before.getTime() / 1000);
    const url = `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&before=${epoch}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      this.logger.error(`error code from strava: ${response.status}`);
      throw new Error('error fetching activities');
    }
    return await response.json();
  }

  async setDescription(
    activityId: number,
    description: string,
    token: string,
  ): Promise<void> {
    this.logger.debug(`setting description for activity ${activityId}`);
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify({ description }),
      },
    );

    if (response.status !== 200) {
      this.logger.error(`error setting description. code: ${response.status}`);
      throw new Error('error setting description');
    }
  }

  public async createWebhookSubscription(
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
      this.logger.error(await response.text());
      throw new Error('error creating webhook subscription');
    }
    const data = await response.json();
    return data.id;
  }

  public async deleteWebhookSubscription(
    token: string,
    subscriptionId: number,
  ): Promise<number> {
    const url = `https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}?client_id=${this.client_id}&client_secret=${this.client_secret}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
    });
    if (!response.ok) {
      this.logger.error(`error code from strava: ${response.status}`);
      this.logger.error(await response.text());
      throw new Error('error deleting webhook subscription');
    }
    const data = await response.json();
    return data.id;
  }
}
