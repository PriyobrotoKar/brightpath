import { randomInt } from 'crypto';
import type { Request, Response } from 'express';
import { OTP_EXPIRY } from './constants';
import { CacheService } from '@/cache/cache.service';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from '@/user/user.types';

export async function generateJwtToken(
  payload: Omit<JWTPayload, 'exp' | 'iat'>,
  jwtService: JwtService,
) {
  return await jwtService.signAsync(payload);
}

export const jwtExtractor = (req: Request) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies) {
    token = req.cookies['access_token'];
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

export function setResponseCookie(res: Response, access_token: string) {
  res.cookie('access_token', access_token, {
    domain: 'localhost',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    httpOnly: true,
  });
}
