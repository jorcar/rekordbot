import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request as RequestType } from 'express';
import { TokenPayload } from '../auth-utils/token.service';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from '../config/configuration';

export interface ValidatedUser {
  userId: number;
  user: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWTFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtConfig>('jwt').secret,
    });
  }

  private static extractJWTFromCookie(req: RequestType): string | null {
    if (req.cookies && 'token' in req.cookies && req.cookies.token.length > 0) {
      return req.cookies.token;
    }
  }

  // invoked by framework
  validate(payload: TokenPayload): ValidatedUser {
    return { userId: payload.sub, user: payload.user };
  }
}
