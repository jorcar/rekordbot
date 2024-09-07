import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class StravaService {
  private readonly logger = new Logger(StravaService.name);
  // TODO: move to config
  private client_id = 27973;
  private client_secret = 'bfb397cb3618f6df91fa939456ce39f7864eb3ae';

  async exchangeToken(code: string): Promise<StravaTokenResponse | undefined> {
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
      this.logger.debug('error code from strava', response.status);
      return undefined;
    }
    return response.json();
  }
}
