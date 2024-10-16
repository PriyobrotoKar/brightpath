import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { Module } from '@nestjs/common';
import { CacheService } from './cache/cache.service';
import { CacheModule } from './cache/cache.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/auth.guard';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `../../.env${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}`,
    }),
    AuthModule,
    PrismaModule,
    CacheModule,
    UserModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    CacheService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
