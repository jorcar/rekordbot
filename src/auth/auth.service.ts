import { Injectable, Logger } from '@nestjs/common';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { PasswordHashService } from '../auth-utils/password-hash.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private passwordHashService: PasswordHashService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | undefined> {
    const user = await this.userService.findByEmail(email);
    if (
      user &&
      (await this.passwordHashService.comparePasswords(pass, user.password))
    ) {
      return user;
    }
    return undefined;
  }
}
