import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaAthlete } from './strava/strava-athlete.entity';
import { StravaCredentials } from './strava/strava-credentials.entity';
import { User } from './user/user.entity';
import { StravaModule } from './strava/strava.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { StravaAchievementEffort } from './strava/strava-achievement-effort.entity';
import { StravaActivity } from './strava/strava-activity.entity';
import { StravaSegmentEffort } from './strava/strava-segment-effort.entity';
import { StravaSegment } from './strava/strava-segment.entity';
import { JobModule } from './job/job.module';
import configuration, { DatabaseConfig } from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    UserModule,
    StravaModule,
    AuthModule,
    JobModule.forRoot({
      connectionString: 'postgres://postgres@localhost:5432/my_database',
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
          entities: [
            StravaSegment,
            StravaSegmentEffort,
            StravaAthlete,
            StravaAchievementEffort,
            StravaActivity,
            StravaCredentials,
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
