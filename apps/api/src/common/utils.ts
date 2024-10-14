import { randomInt } from 'crypto';
import type { Request, Response } from 'express';
import { OTP_EXPIRY } from './constants';
import { CacheService } from '@/cache/cache.service';
import { Logger } from '@nestjs/common';
import { JWTPayload } from '@/auth/types/jwt-payload';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import refreshJwtConfig from '@/auth/config/refresh-jwt.config';

export const jwtExtractor = (
  req: Request,
  type: 'access_token' | 'refresh_token',
) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies) {
    token = req.cookies[type];
  }

  return token;
};

export async function generateOtp(email: string, cache: CacheService) {
  const logger = new Logger();
  const otp = randomInt(100000, 999999).toString();

  await cache.setCache('otp', email, otp, OTP_EXPIRY);

  logger.log(
    `New otp: ${otp} has been generated for email: ${email} which will be valid till ${new Date(Date.now() + OTP_EXPIRY * 1000).toLocaleDateString()}`,
  );

  return otp;
}

export function setResponseCookie(res: Response, key: string, value: string) {
  res.cookie(key, value, {
    domain: 'localhost',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    httpOnly: true,
  });
}

export async function generateJwtTokens(
  payload: JWTPayload,
  jwt: JwtService,
  refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
) {
  const [access_token, refresh_token] = await Promise.all([
    jwt.signAsync(payload),
    jwt.signAsync(payload, refreshJwtConfiguration),
  ]);
  return { access_token, refresh_token };
}
