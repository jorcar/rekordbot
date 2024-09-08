import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthUtilsModule } from '../auth-utils/auth-utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthUtilsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
