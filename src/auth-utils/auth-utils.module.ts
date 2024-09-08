import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'asd', //jwtConstants.secret, FIXME!
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [],
  providers: [TokenService],
  exports: [TokenService],
})
export class AuthUtilsModule {}
