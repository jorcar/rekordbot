import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { PasswordHashService } from './password-hash.service';
import { CookieService } from './cookie.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'asd', //jwtConstants.secret, FIXME!
      signOptions: { expiresIn: '8d' },
    }),
  ],
  controllers: [],
  providers: [TokenService, PasswordHashService, CookieService],
  exports: [CookieService, PasswordHashService],
})
export class AuthUtilsModule {}
