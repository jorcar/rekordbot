import { Module } from '@nestjs/common';
import { StravaAuthController } from './strava-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaCredentials } from './strava-credentials.entity';
import { StravaService } from './strava.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StravaAthlete, StravaCredentials]),
    UserService,
  ],
  controllers: [StravaAuthController],
  providers: [StravaService],
  exports: [StravaService],
})
export class StravaModule {}
