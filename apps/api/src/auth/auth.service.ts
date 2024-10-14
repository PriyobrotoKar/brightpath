import { CacheService } from '@/cache/cache.service';
import { createEvent } from '@/common/event';
import { createUser, getUserByEmailOrId } from '@/common/user';
import { generateJwtTokens, generateOtp } from '@/common/utils';
import bcrypt from 'bcrypt';
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

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;
  constructor(
    private readonly prisma: PrismaService,
    private cache: CacheService,
    private jwt: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
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

    const correctOtp = await this.cache.getCachedValue('otp', email);

    if (!otp || !correctOtp) {
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

    const isOtpValid = correctOtp === otp;

    if (!isOtpValid) {
      throw new BadRequestException('Incorrect OTP');
    }

    await this.cache.deleteCachedValue('otp', email);

    const tokens = await generateJwtTokens(
      {
        id: user.id,
        email: user.email,
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

    const hashedRefreshToken = await this.cache.getCachedValue(
      'refreshToken',
      user.id,
    );

    if (!hashedRefreshToken)
      throw new UnauthorizedException('Refresh token not found for this user');

    const refreshTokenMatched = await bcrypt.compare(token, hashedRefreshToken);

    if (!refreshTokenMatched) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return { id: user.id, email: user.email };
  }

  private async updateRefreshToken(userId: string, refresh_token: string) {
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 12);
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
