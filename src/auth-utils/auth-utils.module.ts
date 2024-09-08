import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { PasswordHashService } from './password-hash.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'asd', //jwtConstants.secret, FIXME!
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [],
  providers: [TokenService, PasswordHashService],
  exports: [TokenService, PasswordHashService],
})
export class AuthUtilsModule {}
