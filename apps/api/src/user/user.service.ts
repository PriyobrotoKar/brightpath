import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { JWTPayload } from './user.types';
import { UpdateUserDto } from './dto/update.user';
import { generateOtp } from '@/common/utils';
import { CacheService } from '@/cache/cache.service';
import { createEvent } from '@/common/event';
import { JwtService } from '@nestjs/jwt';
import { getUserByEmailOrId } from '@/common/user';

@Injectable()
export class UserService {
  private readonly logger: LoggerService;
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private jwt: JwtService,
  ) {
    this.logger = new Logger(UserService.name);
  }

  async getSelf({ id }: JWTPayload) {
    const user = await getUserByEmailOrId(id, this.prisma, this.cache);
    return user;
  }

  async updateSelf(user: JWTPayload, dto: UpdateUserDto) {
    const { email, ...data } = dto;

    if (email && user.email !== email) {
      const userExists = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (userExists) {
        throw new BadRequestException('User with this email already exists');
      }

      const otp = await generateOtp(user.email, this.cache);

      await this.cache.setCache(
        'tempEmail',
        user.email,
        dto.email,
        24 * 60 * 60,
      );

      await createEvent({
        eventType: 'email_verification',
        recipient: {
          email: dto.email,
        },
        variables: {
          otp,
        },
      });
    }

    const oldUser = await getUserByEmailOrId(user.id, this.prisma, this.cache);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...data,
        isOnboardingFinished: true,
      },
    });

    await this.cache.setCache('user', user.id, updatedUser);

    if (!oldUser.isOnboardingFinished) {
      await createEvent({
        eventType: 'account_creation',
        recipient: {
          email: updatedUser.email,
        },
        variables: {
          name: updatedUser.name,
        },
      });
    }

    this.logger.log(
      `User: ${user.id} has been updated with ${JSON.stringify(dto)}`,
    );

    return updatedUser;
  }

  async verifyEmailChange(otp: string, user: JWTPayload) {
    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const correctOtp = await this.cache.getCachedValue('otp', user.email);

    const isOtpValid = correctOtp === otp;

    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const newEmail = await this.cache.getCachedValue('tempEmail', user.email);

    const updateUserEmail = this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: newEmail,
      },
    });

    const deleteTempEmail = this.cache.deleteCachedValue(
      'tempEmail',
      user.email,
    );

    const deleteOtp = this.cache.deleteCachedValue('otp', user.email);

    const results = await Promise.all([
      updateUserEmail,
      deleteTempEmail,
      deleteOtp,
    ]);

    const updatedUser = results[0];

    const access_token = await this.jwt.signAsync({
      id: updatedUser.id,
      email: updatedUser.email,
    });

    return { ...updatedUser, access_token };
  }
}
