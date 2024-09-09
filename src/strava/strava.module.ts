import { Module } from '@nestjs/common';
import { StravaAuthController } from './strava-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaCredentials } from './strava-credentials.entity';
import { StravaService } from './strava.service';
import { StravaApiService } from './strava-api.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StravaAthlete, StravaCredentials]),
    UserModule,
  ],
  controllers: [StravaAuthController],
  providers: [StravaService, StravaApiService],
  exports: [StravaService],
})
export class StravaModule {}
