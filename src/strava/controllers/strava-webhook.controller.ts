import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { StravaService } from '../strava.service';
import { JobEnqueuerService } from '../../job/job-enqueuer.service';
import {
  STRAVA_ACTIVITY_CREATED_JOB,
  STRAVA_ACTIVITY_DELETED_JOB,
  STRAVA_ACTIVITY_UPDATED_JOB,
  StravaActivityCreatedJob,
  StravaActivityDeletedJob,
  StravaActivityUpdatedJob,
} from '../../jobs';

@Controller('/strava/webhook')
export class StravaWebhookController {
  private readonly logger = new Logger(StravaWebhookController.name);

  constructor(
    private stravaService: StravaService,
    private jobPublisher: JobEnqueuerService,
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
    if (body.object_type === 'activity') {
      if (body.aspect_type === 'create') {
        this.logger.debug(
          `Creating activity created job for activity ${body.object_id}`,
        );
        await this.jobPublisher.enqueue<StravaActivityCreatedJob>(
          STRAVA_ACTIVITY_CREATED_JOB,
          {
            stravaAthleteId: body.owner_id,
            stravaActivityId: body.object_id,
          },
        );
      }
      if (body.aspect_type === 'update' && body.updates.type) {
        this.logger.debug(
          `Creating activity updated job for activity ${body.object_id}`,
        );
        await this.jobPublisher.enqueue<StravaActivityUpdatedJob>(
          STRAVA_ACTIVITY_UPDATED_JOB,
          {
            stravaAthleteId: body.owner_id,
            stravaActivityId: body.object_id,
            activityType: body.updates.type,
          },
        );
      }
      if (body.aspect_type === 'delete') {
        this.logger.debug(
          `Creating activity deleted job for activity ${body.object_id}`,
        );
        await this.jobPublisher.enqueue<StravaActivityDeletedJob>(
          STRAVA_ACTIVITY_DELETED_JOB,
          {
            stravaAthleteId: body.owner_id,
            stravaActivityId: body.object_id,
          },
        );
      }
    }
  }
}
