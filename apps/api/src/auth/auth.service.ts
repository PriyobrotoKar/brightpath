import { OTP_EXPIRY } from '@/common/constants';
import { createEvent } from '@/common/event';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async sendOtp(email: string) {
    // Check if the email is valid or not
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }
    // Create a new user if there does not exist any user with that email.
    const user = await this.createUserIfNotExist(email);
    // Generate an OTP
    const otp = await this.generateOtp(user.email, user.id);
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

  private async generateOtp(email: string, userId: string) {
    const otp = randomInt(100000, 999999).toString();
    const otpDuration = new Date(Date.now() + OTP_EXPIRY);

    await this.prisma.otp.upsert({
      where: {
        userId,
      },
      update: {
        code: otp,
        expiresAt: otpDuration,
      },
      create: {
        code: otp,
        expiresAt: otpDuration,
        user: {
          connect: {
            email,
          },
        },
      },
    });

    return otp.toString();
  }
}
