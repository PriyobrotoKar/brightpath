import { CacheService } from '@/cache/cache.service';
import { createUser, getUserByEmailOrId } from '@/common/user';
import { generateJwtTokens, generateOtp } from '@/common/utils';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  LoggerService,
  NotFoundException,
  Logger,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './types/jwt-payload';
import refreshJwtConfig from './config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import { PrismaClient } from '@brightpath/db';
import argon2 from 'argon2';

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;
  private readonly prisma: PrismaClient;

  constructor(
    private readonly prismaService: PrismaService,
    private cache: CacheService,
    private jwt: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
  ) {
    this.logger = new Logger(AuthService.name);
    this.prisma = this.prismaService.client;
  }

  async sendOtp(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }
    const user = await this.createUserIfNotExist(email);

    if (user.accountStatus === 'PENDING_DELETION') {
      throw new BadRequestException(
        'Your account has been marked for deletion. Please contact support for assistance.',
      );
    }

    await generateOtp(user.email, this.cache);

    // await createEvent({
    //   eventType: 'email_verification',
    //   recipient: {
    //     email,
    //   },
    //   variables: {
    //     otp,
    //   },
    // });
    return `OTP has been sent to ${email}`;
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }

    const correctOtp = await this.cache.getCachedValue('otp', email);

    if (!otp || !correctOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('No user is found with this email');
    }

    const isOtpValid = correctOtp === otp;

    if (!isOtpValid) {
      throw new BadRequestException('Incorrect OTP');
    }

    await this.cache.deleteCachedValue('otp', email);

    if (
      user.accountStatus === 'DISABLED' ||
      user.accountStatus === 'UNVERIFIED'
    ) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { accountStatus: 'ACTIVE' },
      });
    }

    const tokens = await generateJwtTokens(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwt,
      this.refreshJwtConfiguration,
    );

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    this.logger.log(`User: ${user.id} has been successfully logged in`);

    return { ...user, ...tokens };
  }

  async refreshToken(user: JWTPayload) {
    const tokens = await generateJwtTokens(
      user,
      this.jwt,
      this.refreshJwtConfiguration,
    );
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async verifyMagicLink(code: string) {
    const userId = await this.cache.getCachedValue<string>('magicCode', code);

    if (!userId) {
      throw new UnauthorizedException('Invalid magic link');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid magic link');
    }

    if (
      user.accountStatus === 'DISABLED' ||
      user.accountStatus === 'UNVERIFIED'
    ) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { accountStatus: 'ACTIVE' },
      });
    }

    const tokens = await generateJwtTokens(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwt,
      this.refreshJwtConfiguration,
    );

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    this.logger.log(`User: ${user.id} has been successfully logged in`);

    return { ...user, ...tokens };
  }

  private async createUserIfNotExist(email: string) {
    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      user = await createUser({ email }, this.prisma);

      this.logger.log(`A new user with id: ${user.id} has been created`);
    }

    return user;
  }

  async validateRefreshToken(token: string, currentUser: JWTPayload) {
    const user = await getUserByEmailOrId(
      currentUser.id,
      this.prisma,
      this.cache,
    );

    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    const hashedRefreshToken = await this.cache.getCachedValue<string>(
      'refreshToken',
      user.id,
    );

    if (!hashedRefreshToken)
      throw new UnauthorizedException('Refresh token not found for this user');

    const refreshTokenMatched = await argon2.verify(hashedRefreshToken, token);

    if (!refreshTokenMatched) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  async logout(user: JWTPayload) {
    await this.cache.deleteCachedValue('refreshToken', user.id);
    return 'User logged out successfully';
  }

  private async updateRefreshToken(userId: string, refresh_token: string) {
    const hashedRefreshToken = await argon2.hash(refresh_token);

    const expiryInSecs =
      Number(this.refreshJwtConfiguration.expiresIn.toString().slice(0, -1)) *
      24 *
      60 *
      60;

    await this.cache.setCache(
      'refreshToken',
      userId,
      hashedRefreshToken,
      expiryInSecs,
    );
  }
}
