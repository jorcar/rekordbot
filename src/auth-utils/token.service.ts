import { Injectable, Logger } from '@nestjs/common';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  constructor(private jwtService: JwtService) {}

  async generateToken(user: User): Promise<string> {
    const payload = { user: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
