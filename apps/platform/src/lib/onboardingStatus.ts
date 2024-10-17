'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface OnboardingStatus {
  step: number;
  isOnboardingFinished: boolean;
}

const paths = [
  '/auth/role',
  '/auth/signup',
  '/auth/otp',
  '/auth/profile',
  '/auth/complete',
];

// eslint-disable-next-line @typescript-eslint/require-await -- This has to be a async function without await
export const getPath = async (step: number): Promise<string> =>
  paths[step - 1] || '/auth/role';

const key = 'onboarding-status';
const totalSteps = 5;

const checkisOnboardingFinished = (currentStep: number): boolean =>
  currentStep === totalSteps;

export const setOnboardingStatus = async (
  data: Omit<OnboardingStatus, 'isOnboardingFinished'>,
  // eslint-disable-next-line @typescript-eslint/require-await -- This has to be a async function without await
): Promise<void> => {
  const value: OnboardingStatus = {
    step: data.step,
    isOnboardingFinished: checkisOnboardingFinished(data.step),
  };
  cookies().set(key, JSON.stringify(value), {
    expires: new Date(Date.now() + 1000 * 60 * 15),
  }); // 5 min expiration
};

// eslint-disable-next-line @typescript-eslint/require-await -- This has to be a async function without await
export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  const cookie = cookies().get(key);

  if (cookie === undefined) {
    return {
      step: 1,
      isOnboardingFinished: false,
    };
  }

  return JSON.parse(cookie.value) as OnboardingStatus;
};

export const removeOnboardingStatus = async (
  request?: NextRequest,
  // eslint-disable-next-line @typescript-eslint/require-await -- This has to be a async function without await
): Promise<NextResponse | undefined> => {
  if (request) {
    const res = NextResponse.next();
    res.cookies.delete(key);
    return res;
  }
  cookies().delete(key);
};
