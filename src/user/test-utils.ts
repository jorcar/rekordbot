import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { DatabaseConfig } from '../config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PasswordHashService } from '../auth-utils/password-hash.service';
import { CookieService } from '../auth-utils/cookie.service';

export async function createTestingModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [configuration],
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const config = configService.get<DatabaseConfig>('database');
          return {
            type: 'postgres',
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.database,
            poolSize: config.poolSize,
            entities: [User],
            synchronize: config.synchronize,
          };
        },
      }),
      TypeOrmModule.forFeature([User]),
    ],
    controllers: [UserController],
    providers: [
      UserRepository,
      UserService,
      { provide: PasswordHashService, useValue: {} },
      { provide: CookieService, useValue: {} },
    ],
  }).compile();
}
