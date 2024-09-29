import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './achievement.entity';
import { StravaModule } from '../strava/strava.module';
import { StravaActivityAnalysisJobProcessor } from './strava-activity-analysis.job-processor';
import { ActivityAnalyzer } from './activity-analysis/activity-analyzer';
import { ActivityAchievementsAnalyzer } from './activity-analysis/grouped-analyzers/activity-achievements-analyzer';
import { SegmentEffortsAnalyzer } from './activity-analysis/grouped-analyzers/segment-efforts-analyzer';
import { AchievementEffortsAnalyzer } from './activity-analysis/grouped-analyzers/achievement-efforts-analyzer';
import { AchievementRepository } from './achievement.repository';
import { TransactionRunner } from '../common/transaction-runner.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement]), StravaModule],
  controllers: [],
  providers: [
    StravaActivityAnalysisJobProcessor,
    ActivityAnalyzer,
    ActivityAchievementsAnalyzer,
    SegmentEffortsAnalyzer,
    AchievementEffortsAnalyzer,
    AchievementRepository,
    TransactionRunner,
  ],
  exports: [AchievementRepository],
})
export class StravaAnalysisModule {}
