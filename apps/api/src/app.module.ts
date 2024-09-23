import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
