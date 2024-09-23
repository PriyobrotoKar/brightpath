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
      return new BadRequestException('Invalid email');
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
    const otp = randomInt(100000, 999999);
    const optDuration = Date.now() + OTP_EXPIRY;
    //TODO: Store the otp in the db.
    return otp.toString();
  }
}
