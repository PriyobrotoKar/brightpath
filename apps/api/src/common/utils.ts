import { randomInt } from 'crypto';
import type { Request, Response } from 'express';
import { OTP_EXPIRY } from './constants';
import { CacheService } from '@/cache/cache.service';
import { Logger } from '@nestjs/common';

export function cookieExtractor(req: Request) {
  const token = req.cookies.access_token?.split(' ')[1] ?? undefined;
  return token;
}

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
  res.cookie('access_token', `Bearer ${access_token}`, {
    domain: 'localhost',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    httpOnly: true,
  });
}
