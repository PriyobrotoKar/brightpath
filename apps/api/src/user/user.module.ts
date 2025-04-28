import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '@/auth/auth.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
