import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { PasswordHashService } from './password-hash.service';
import { CookieService } from './cookie.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtConfig } from '../config/configuration';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const authConfig = configService.get<JwtConfig>('jwt');
        return {
          secret: authConfig.secret,
          signOptions: { expiresIn: authConfig.expiresIn },
        };
      },
    }),
  ],
  controllers: [],
  providers: [TokenService, PasswordHashService, CookieService],
  exports: [CookieService, PasswordHashService],
})
export class AuthUtilsModule {}
