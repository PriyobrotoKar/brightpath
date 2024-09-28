import { CacheService } from '@/cache/cache.service';
import { OTP_EXPIRY } from '@/common/constants';
import { createEvent } from '@/common/event';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;
  constructor(
    private readonly prisma: PrismaService,
    private cache: CacheService,
    private jwt: JwtService,
  ) {}

  async sendOtp(email: string) {
    // Check if the email is valid or not
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }
    // Create a new user if there does not exist any user with that email.
    const user = await this.createUserIfNotExist(email);
    // Generate an OTP
    const otp = await this.generateOtp(user.email);
    // Create an event of `email_validation`
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
    // Check if the email is valid or not
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }

    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check if any user exists with this email or not
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('No user is found with this email');
    }
    // Check if any otp exists in redis with this email
    const correctOtp = await this.cache.getCachedValue('otp', email);

    const isOtpValid = correctOtp === otp;

    if (!isOtpValid) {
      throw new BadRequestException('Incorrect OTP');
    }
    // If valid then delete the otp from redis
    await this.cache.deleteCachedValue('otp', email);
    // create a jwt token for the user and set it as a cookie
    const access_token = await this.jwt.signAsync({
      id: user.id,
      email: user.email,
    });
    // return the user object as response
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
    }

    return user;
  }

  private async generateOtp(email: string) {
    const otp = randomInt(100000, 999999).toString();

    await this.cache.setCache('otp', email, otp, OTP_EXPIRY);

    return otp;
  }
}
