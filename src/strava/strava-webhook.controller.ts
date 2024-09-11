import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { StravaService } from './strava.service';

@Controller('/strava/webhook')
export class StravaWebhookController {
  private readonly logger = new Logger(StravaWebhookController.name);

  constructor(private stravaService: StravaService) {}

  @Get()
  get(@Req() req: any) {
    this.logger.log('Echoing Strava challenge');
    const challenge = req.query['hub.challenge'];
    return { 'hub.challenge': challenge };
  }

  @Post()
  @HttpCode(200)
  async post(@Body() body: any) {
    this.logger.log('Strava webhook called');
    this.logger.debug(JSON.stringify(body));
    // TODO: put the message in a queue for async processing
    if (body.object_type === 'activity') {
      // temp to test
      this.logger.log('Activity webhook');
      const athlete = body.owner_id;
      const acti = await this.stravaService.fetchActivities(
        body.object_id,
        athlete,
      );
      console.log(JSON.stringify(acti));
    }
  }
}
