import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaAthlete } from './strava/entities/strava-athlete.entity';
import { StravaCredentials } from './strava/entities/strava-credentials.entity';
import { User } from './user/user.entity';
import { StravaModule } from './strava/strava.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { StravaAchievementEffort } from './strava/entities/strava-achievement-effort.entity';
import { StravaActivity } from './strava/entities/strava-activity.entity';
import { StravaSegmentEffort } from './strava/entities/strava-segment-effort.entity';
import { StravaSegment } from './strava/entities/strava-segment.entity';
import { JobModule } from './job/job.module';
import configuration, {
  DatabaseConfig,
  toConnectionString,
} from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StravaBackfillStatus } from './strava/entities/strava-backfill-status.entity';
import { Achievement } from './strava-analysis/achievement.entity';
import { StravaAnalysisModule } from './strava-analysis/strava-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    UserModule,
    StravaModule,
    StravaAnalysisModule,
    AuthModule,
    JobModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<DatabaseConfig>('database');
        return {
          connectionString: toConnectionString(config),
          maxNumberConnections: 5,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<DatabaseConfig>('database');
        return {
          type: 'postgres',
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
          /*namingStrategy: {
            tableName: 'snake_case',
            columnName: 'snake_case',
            relationName: 'snake_case',
          }*/
          poolSize: 3,
          entities: [
            Achievement,
            StravaSegment,
            StravaSegmentEffort,
            StravaAthlete,
            StravaAchievementEffort,
            StravaActivity,
            StravaCredentials,
            StravaBackfillStatus,
            User,
          ],
          synchronize: config.synchronize,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule {}
