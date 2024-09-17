import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import {
  STRAVA_ACTIVITY_ANALYSIS_JOB,
  StravaActivityAnalysisJob,
} from './jobs';
import { Logger } from '@nestjs/common';
import { ActivityAnalyzer } from '../activity-analysis/activity-analyzer';
import { StravaService } from '../strava.service';

@JobProcessor(STRAVA_ACTIVITY_ANALYSIS_JOB)
export class StravaActivityAnalysisJobProcessor
  implements QueuedJobProcessor<StravaActivityAnalysisJob>
{
  private readonly logger = new Logger(StravaActivityAnalysisJobProcessor.name);
  constructor(
    private activityAnalyzer: ActivityAnalyzer,
    private stravaService: StravaService,
  ) {}

  async processJob(job: StravaActivityAnalysisJob): Promise<void> {
    const achievements = await this.activityAnalyzer.analyzeActivity(
      job.stravaActivityId,
    );
    this.logger.debug(`Achievements identified: ${achievements}`);
    if (achievements.length > 0) {
      const str = achievements.join('\n');
      await this.stravaService.setDescription(
        job.stravaAthleteId,
        job.stravaActivityId,
        `${str}\n\n🤖 activity analysis by rekordbot.com`,
      );
    }
  }
}
