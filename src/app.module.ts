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
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';

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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      //password: 'root',
      database: 'my_database',
      entities: [
        StravaSegment,
        StravaSegmentEffort,
        StravaAthlete,
        StravaAchievementEffort,
        StravaActivity,
        StravaCredentials,
        User,
      ],
      synchronize: true, // TODO: figure out migrations for prod setup
    }),
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule {}
