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

  cookies().set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiredAt,
    sameSite: 'lax',
    path: '/',
  });
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
  request: NextRequest,
): Promise<NextResponse | undefined> => {
  try {
    const session = request.cookies.get('session')?.value;

    if (!session) {
      return;
    }

    await jwtVerify<Session>(session, encodedKey, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    if (error instanceof JWTExpired) {
      const payload = error.payload as Session;
      return handleExiredSession(payload);
    }
  }
};

const handleExiredSession = async (
  expiredSession: Session,
): Promise<NextResponse> => {
  const res = NextResponse.next();

  const refreshTokenRes = await refreshToken(expiredSession.refreshToken);
  const newSessionPayload: Session = {
    ...expiredSession,
    accessToken: refreshTokenRes.access_token,
    refreshToken: refreshTokenRes.refresh_token,
  };

  const newSession = await encode(newSessionPayload);

  res.cookies.set('session', newSession, {
    httpOnly: true,
    secure: true,
    expires: expiredAt,
    sameSite: 'lax',
  });

  return res;
};
