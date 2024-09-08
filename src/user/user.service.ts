import { Injectable, Logger } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async registerUser(
    email: string,
    hashed_password: string,
  ): Promise<User | undefined> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      this.logger.log('User already exists');
      return;
    }
    const user = new User();
    user.email = email;
    user.password = hashed_password;
    this.logger.log('User created');
    return await this.userRepository.save(user);
  }
}
