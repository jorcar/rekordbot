import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthUtilsModule } from '../auth-utils/auth-utils.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, PassportModule, AuthUtilsModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, PassportModule],
  exports: [AuthService],
})
export class AuthModule {}
