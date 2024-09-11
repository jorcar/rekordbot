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

  constructor(
    private stravaService: StravaService,
    //private jobPublisherService: JobsPublisherService,
  ) {}

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
    if (body.object_type === 'activity' && body.aspect_type === 'create') {
      this.logger.debug(
        `Creating activity created job for activity ${body.object_id}`,
      );
      /*  await this.jobPublisherService.enqueue(STRAVA_ACTIVITY_CREATED_JOB, {
        stravaAthleteId: body.owner_id,
        stravaActivityId: body.object_id,
      });*/
      this.logger.log('Activity webhook');
    }
  }
}
