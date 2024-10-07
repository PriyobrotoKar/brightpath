import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getOnboardingStatus, getPath } from './lib/onboardingStatus';

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  const { step } = await getOnboardingStatus();
  if (
    request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== getPath(step)
  ) {
    return NextResponse.redirect(new URL(getPath(step), request.url));
  }
}
