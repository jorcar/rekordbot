import { Injectable, Logger } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordHashService } from '../auth-utils/password-hash.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private passwordHashService: PasswordHashService,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id } });
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
    return await this.userRepository.save(user);
  }
}
