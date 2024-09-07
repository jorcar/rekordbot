import { Module } from '@nestjs/common';
import { StravaAuthController } from './strava-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaAthlete } from './strava-athlete.entity';
import { StravaCredentials } from './strava-credentials.entity';
import { StravaService } from './strava.service';

@Module({
  imports: [TypeOrmModule.forFeature([StravaAthlete, StravaCredentials])],
  controllers: [StravaAuthController],
  providers: [StravaService],
})
export class StravaModule {}
