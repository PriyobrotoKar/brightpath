import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  getOnboardingStatus,
  getPath,
  removeOnboardingStatus,
} from './lib/onboardingStatus';
import { getSession, updateSession } from './lib/session';

const ROOT_DOMAIN = 'brightpath.co' as const;

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0] ?? '';

  // Check if it is in local development environment
  if (hostname.includes('localhost')) {
    if (hostname.endsWith('.localhost')) {
      return hostname.split('.')[0] ?? null;
    }
    return null;
  }

  // Check if it is in production environment
  if (
    hostname !== ROOT_DOMAIN &&
    hostname !== `www.${ROOT_DOMAIN}` &&
    hostname.endsWith(`.${ROOT_DOMAIN}`)
  ) {
    return hostname.split('.')[0] ?? null;
  }

  return null;
}

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  // Attempt to update the session, and return the response if it exists (e.g., session updated successfully).
  const res = await updateSession(request);

  if (res) {
    return res;
  }

  const session = await getSession();
  const subdomain = extractSubdomain(request);

  // Retrieve the user's onboarding step status.
  const { step } = await getOnboardingStatus();

  if (subdomain) {
    NextResponse.rewrite(new URL(`/${subdomain}`, request.url));

    if (!session) {
      if (request.nextUrl.pathname.includes('/dashboard')) {
        return NextResponse.redirect(new URL(`/auth/signin`, request.url));
      }
    } else if (request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL(`/dashboard`, request.url));
    }

    return NextResponse.rewrite(
      new URL(
        `/${subdomain}${request.nextUrl.pathname}${request.nextUrl.search}`,
        request.url,
      ),
    );
  }

  // If a session exists and the user is trying to access an auth-related page (e.g., sign in/up), redirect them to the dashboard.
  if (
    session &&
    session.user.isOnboardingFinished &&
    (request.nextUrl.pathname.startsWith('/auth') ||
      request.nextUrl.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (
    session &&
    session.user.isOnboardingFinished &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    return removeOnboardingStatus(request);
  }

  // If no session exists and the user is trying to access dashboard page, redirect them to the sign-in page with a callback URL.
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callback_url=${request.nextUrl.pathname}`,
        request.url,
      ),
    );
  }

  // If the user is in an auth flow but trying to access an auth page unrelated to sign-in,
  // and they haven't completed the onboarding step, redirect them to the appropriate onboarding page.
  if (
    request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/auth/magic') &&
    !request.nextUrl.pathname.startsWith('/auth/signin') &&
    request.nextUrl.pathname !== (await getPath(step))
  ) {
    return NextResponse.redirect(new URL(await getPath(step), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
