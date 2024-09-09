import { Controller, Get, Logger, Post, Req } from '@nestjs/common';

@Controller('/strava/webhook')
export class StravaWebhookController {
  private readonly logger = new Logger(StravaWebhookController.name);

  @Get()
  get(@Req() req: any) {
    this.logger.log('Echoing Strava challenge');
    return req.query['hub.challenge'];
  }

  @Post()
  post() {
    this.logger.log('Strava webhook called');
  }
}
