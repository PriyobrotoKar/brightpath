'use server';

import type { JWTPayload } from 'jose';
import { SignJWT, jwtVerify } from 'jose';
import { JWTExpired } from 'jose/errors';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { refreshToken } from '@/api/services/auth';

interface Session extends JWTPayload {
  user: {
    id: string;
    email: string;
    isOnboardingFinished: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET);
const expiredAt = new Date(
  Date.now() + Number(process.env.REFRESH_JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000,
);
const jwtExpiry = process.env.JWT_EXPIRES_IN || '30s';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  expires: expiredAt,
  sameSite: 'lax' as const,
};

const encode = async (payload: Session): Promise<string> => {
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(jwtExpiry)
    .sign(encodedKey);

  return session;
};

export const createSession = async (payload: Session): Promise<void> => {
  const session = await encode(payload);

  cookies().set('session', session, cookieOptions);
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const token = cookies().get('session')?.value;

    if (!token) return null;

    const { payload } = await jwtVerify<Session>(token, encodedKey, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    return null;
  }
};

export const updateSession = async (
  request?: NextRequest,
  user?: Partial<Session['user']>,
): Promise<NextResponse | undefined> => {
  try {
    const session = request
      ? request.cookies.get('session')?.value
      : cookies().get('session')?.value;

    if (!session) {
      return;
    }

    const { payload } = await jwtVerify<Session>(session, encodedKey, {
      algorithms: ['HS256'],
    });

    payload.user = { ...payload.user, ...user };

    if (!request) {
      await handleExiredSession(payload, 'cookies');
    }
  } catch (error) {
    if (error instanceof JWTExpired) {
      const payload = error.payload as Session;
      return handleExiredSession(payload);
    }
  }
};

const handleExiredSession = async (
  expiredSession: Session,
  method: 'cookies' | 'response' = 'response',
): Promise<NextResponse | undefined> => {
  const res = NextResponse.next();

  const refreshTokenRes = await refreshToken(expiredSession.refreshToken);
  const newSessionPayload: Session = {
    ...expiredSession,
    accessToken: refreshTokenRes.access_token,
    refreshToken: refreshTokenRes.refresh_token,
  };

  if (method === 'response') {
    const newSession = await encode(newSessionPayload);

    res.cookies.set('session', newSession, cookieOptions);

    return res;
  }

  await createSession(newSessionPayload);
};
