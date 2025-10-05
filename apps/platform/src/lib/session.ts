'use server';

import type { JWTPayload } from 'jose';
import { SignJWT, jwtVerify } from 'jose';
import { JWTExpired } from 'jose/errors';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import type { Role } from '@brightpath/db';
import { refreshToken } from '@/api/services/auth';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role | null;
  isOnboardingFinished: boolean;
}

export interface Session extends JWTPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30s';
const REFRESH_JWT_EXPIRES_IN = parseInt(
  process.env.REFRESH_JWT_EXPIRES_IN ?? '7d',
);
const ENCODED_KEY = new TextEncoder().encode(JWT_SECRET);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  expires: new Date(Date.now() + REFRESH_JWT_EXPIRES_IN * 24 * 60 * 60 * 1000),
  sameSite: 'lax' as const,
};

const encodeSession = async (payload: Session): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(ENCODED_KEY);
};

const decodeSession = async (token: string): Promise<Session | null> => {
  try {
    const { payload } = await jwtVerify<Session>(token, ENCODED_KEY, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
};

export const createSession = async (payload: Session): Promise<void> => {
  const session = await encodeSession(payload);
  cookies().set('session', session, cookieOptions);
};

export const getSession = async (): Promise<Session | null> => {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  return decodeSession(token);
};

// eslint-disable-next-line @typescript-eslint/require-await -- We don't need to await this function
export const removeSession = async (): Promise<void> => {
  cookies().delete('session');
  redirect('/auth/signin');
};

export const updateSession = async (
  request?: NextRequest,
  user?: Partial<User>,
): Promise<NextResponse | undefined> => {
  try {
    const session = request
      ? request.cookies.get('session')?.value
      : cookies().get('session')?.value;

    if (!session) {
      return;
    }

    const { payload } = await jwtVerify<Session>(session, ENCODED_KEY, {
      algorithms: ['HS256'],
    });

    payload.user = { ...payload.user, ...user };

    if (!request) {
      await createSession(payload);
    }
  } catch (error) {
    if (error instanceof JWTExpired) {
      const payload = error.payload as Session;
      return handleExiredSession(payload, request);
    }
  }
};

const handleExiredSession = async (
  expiredSession: Session,
  request?: NextRequest,
): Promise<NextResponse | undefined> => {
  try {
    const refreshTokenRes = await refreshToken(expiredSession.refreshToken);
    const newSessionPayload: Session = {
      ...expiredSession,
      accessToken: refreshTokenRes.access_token,
      refreshToken: refreshTokenRes.refresh_token,
    };

    const newSession = await encodeSession(newSessionPayload);

    if (request) {
      const res = NextResponse.redirect(request.url);
      res.cookies.set('session', newSession, cookieOptions);
      return res;
    }

    cookies().set('session', newSession, cookieOptions);
  } catch (error) {
    const res = NextResponse.next();
    res.cookies.delete('session');
  }
};
