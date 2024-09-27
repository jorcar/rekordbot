import { JobProcessor, QueuedJobProcessor } from '../../job/job-processor';
import {
  STRAVA_ACTIVITY_ANALYSIS_JOB,
  StravaActivityAnalysisJob,
} from './jobs';
import { Logger } from '@nestjs/common';
import { ActivityAnalyzer } from '../activity-analysis/activity-analyzer';
import { StravaService } from '../strava.service';
import { TransactionRunner } from '../transaction-runner.provider';
import { Achievement } from '../entities/achievement.entity';
import { StravaActivityRepository } from '../repositories/strava-activity.repository';
import { AchievementRepository } from '../repositories/achievement.repository';
import { StravaActivity } from '../entities/strava-activity.entity';
import { StravaAthlete } from '../entities/strava-athlete.entity';

@JobProcessor(STRAVA_ACTIVITY_ANALYSIS_JOB)
export class StravaActivityAnalysisJobProcessor
  implements QueuedJobProcessor<StravaActivityAnalysisJob>
{
  private readonly logger = new Logger(StravaActivityAnalysisJobProcessor.name);
  constructor(
    private activityRepo: StravaActivityRepository,
    private achievementRepo: AchievementRepository,
    private activityAnalyzer: ActivityAnalyzer,
    private transactionRunner: TransactionRunner,
    private stravaService: StravaService,
  ) {}

  async processJob(job: StravaActivityAnalysisJob): Promise<void> {
    const activity = await this.activityRepo.findActivity(job.stravaActivityId);
    const athlete = await activity.athlete;
    const achievements = await this.activityAnalyzer.analyzeActivity(activity);
    this.logger.debug(`Achievements identified: ${achievements}`);
    await this.transactionRunner.runInTransaction(async (manager) => {
      await this.achievementRepo.transactional(manager).deleteFor(activity);

      for (const achievement of achievements) {
        const dbAchievement = this.createAchievementRecord(
          activity,
          athlete,
          achievement,
        );
        await this.achievementRepo
          .transactional(manager)
          .createAchievement(dbAchievement);
      }
    });
    if (achievements.length > 0) {
      const str = achievements.join('\n');
      await this.stravaService.setDescription(
        job.stravaAthleteId,
        job.stravaActivityId,
        `${str}\n\n🤖 activity analysis by rekordbot.com`,
      );
    }
  }

  private createAchievementRecord(
    activity: StravaActivity,
    athlete: StravaAthlete,
    achievement: string,
  ) {
    const dbAchievement = new Achievement();
    dbAchievement.activity = Promise.resolve(activity);
    dbAchievement.athlete = Promise.resolve(athlete);
    dbAchievement.description = achievement;
    return dbAchievement;
  }
}
