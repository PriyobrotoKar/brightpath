import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  getOnboardingStatus,
  getPath,
  removeOnboardingStatus,
} from './lib/onboardingStatus';
import { getSession, updateSession } from './lib/session';

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  // Attempt to update the session, and return the response if it exists (e.g., session updated successfully).
  const res = await updateSession(request);
  if (res) {
    return res; // Return early if session update was handled.
  }

  const session = await getSession();

  // Retrieve the user's onboarding step status.
  const { step } = await getOnboardingStatus();

  // If a session exists and the user is trying to access an auth-related page (e.g., sign in/up), redirect them to the dashboard.
  if (
    session?.user.isOnboardingFinished &&
    request.nextUrl.pathname.startsWith('/auth')
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

  // If no session exists and the user is trying to access a non-auth page, redirect them to the sign-in page with a callback URL.
  if (!session && !request.nextUrl.pathname.startsWith('/auth')) {
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
    !request.nextUrl.pathname.startsWith('/auth/signin') &&
    request.nextUrl.pathname !== (await getPath(step))
  ) {
    return NextResponse.redirect(new URL(await getPath(step), request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
