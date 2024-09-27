import { Injectable, Logger } from '@nestjs/common';
import { User } from './user.entity';
import { PasswordHashService } from '../auth-utils/password-hash.service';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private userRepository: UserRepository,
    private passwordHashService: PasswordHashService,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findByEmail(email);
  }

  async registerUser(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      this.logger.log('User already exists');
      return;
    }
    const user = new User();
    user.email = email;
    user.password = await this.passwordHashService.hashPassword(password);
    this.logger.log('User created');
    return await this.userRepository.saveUser(user);
  }
}
