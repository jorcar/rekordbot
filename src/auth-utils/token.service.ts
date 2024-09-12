import { Injectable, Logger } from '@nestjs/common';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  user: string;
  sub: number;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  constructor(private jwtService: JwtService) {}

  async generateToken(user: User): Promise<string> {
    const payload: TokenPayload = { user: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
