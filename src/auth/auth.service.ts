import { Injectable, Logger } from '@nestjs/common';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private userService: UserService) {}

  async validateUser(email: string, pass: string): Promise<User | undefined> {
    //TODO: hash password
    const user = await this.userService.findByEmail(email);
    if (user && user.password === pass) {
      return user;
    }
    return undefined;
  }
}
