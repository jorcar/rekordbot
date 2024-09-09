import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaAthlete } from './strava/strava-athlete.entity';
import { StravaCredentials } from './strava/strava-credentials.entity';
import { User } from './user/user.entity';
import { StravaModule } from './strava/strava.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    StravaModule,
    AuthModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      //password: 'root',
      database: 'my_database',
      entities: [User, StravaAthlete, StravaCredentials],
      synchronize: true, // TODO: figure out migrations for prod setup
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
