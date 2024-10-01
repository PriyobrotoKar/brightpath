import { CacheService } from '@/cache/cache.service';
import { createEvent } from '@/common/event';
import { generateOtp } from '@/common/utils';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  LoggerService,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;
  constructor(
    private readonly prisma: PrismaService,
    private cache: CacheService,
    private jwt: JwtService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async sendOtp(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }
    const user = await this.createUserIfNotExist(email);
    const otp = await generateOtp(user.email, this.cache);

    await createEvent({
      eventType: 'email_verification',
      recipient: {
        email,
      },
      variables: {
        otp,
      },
    });
    return `OTP has been sent to ${email}`;
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }

    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('No user is found with this email');
    }
    const correctOtp = await this.cache.getCachedValue('otp', email);

    const isOtpValid = correctOtp === otp;

    if (!isOtpValid) {
      throw new BadRequestException('Incorrect OTP');
    }

    await this.cache.deleteCachedValue('otp', email);

    const access_token = await this.jwt.signAsync({
      id: user.id,
      email: user.email,
    });

    this.logger.log(`User: ${user.id} has been successfully logged in`);

    return { ...user, access_token };
  }

  private async createUserIfNotExist(email: string) {
    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
        },
      });

      this.logger.log(`A new user with id: ${user.id} has been created`);
    }

    return user;
  }
}
