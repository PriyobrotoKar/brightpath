'use client';
import type { Subscription } from '@brightpath/db';
import { Plan } from '@brightpath/db';
import { Button } from '@brightpath/ui/components/button';
import { toast } from '@brightpath/ui/components/sonner';
import { IconCircleCheck } from '@tabler/icons-react';
import Script from 'next/script';
import React, { useState } from 'react';
import { cn } from '@brightpath/ui/lib/utils';
import {
  createSubscription,
  switchSubscription,
} from '@/api/services/subscription';

interface PlanDetail {
  name: string;
  price: number;
  description: string;
  features: string[];
  value: Plan;
}

const plans: PlanDetail[] = [
  {
    name: 'Starter Plan',
    value: Plan.BASIC,
    price: 3999,
    description: 'Ideal for new educators, launching their first course',
    features: [
      '1 Active Bootcamp',
      'Up to 100 active learners',
      'Custom Branding',
      'Analytics',
      'Payout Integration',
    ],
  },
  {
    name: 'Professional Plan',
    value: Plan.PRO,
    price: 8499,
    description: 'Ideal for experienced creators scaling multiple programs',
    features: [
      'Up to 5 active BootCamps',
      'Unlimited learners',
      'Custom Domain',
      'Drip content scheduling',
      'AI transcriptions',
    ],
  },
  {
    name: 'Business Plan',
    value: Plan.BUSINESS,
    price: 15999,
    description: 'Ideal for new educators, launching their first course',
    features: [
      '1 Active Bootcamp',
      'Up to 100 active learners',
      'Custom Branding',
      'Analytics',
      'Payout Integration',
    ],
  },
];

interface PlansProps {
  currentSubscription: Subscription | null;
}

function Plans({ currentSubscription }: PlansProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<Plan | null>(null);

  const handlePayment = async (plan: Plan): Promise<void> => {
    setIsLoading(plan);

    try {
      const { subscriptionId } = currentSubscription
        ? await switchSubscription(plan)
        : await createSubscription(plan);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        subscription_id: subscriptionId,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any -- have to use it as razorpay is not typed
      const razorpay = new (window as any).Razorpay(options);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- have to use it as razorpay is not typed
      razorpay.open();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-card flex gap-4 rounded-lg border p-2">
      {plans.map((plan) => {
        const isActive = currentSubscription?.plan === plan.value;

        return (
          <div
            className={cn(
              'flex-1 space-y-5 rounded-md p-4',
              isActive && 'bg-secondary border-primary border-2',
            )}
            key={plan.name}
          >
            <div className="space-y-1">
              <h3 className="text-sm">{plan.name}</h3>
              <div className="text-xl">
                ₹{plan.price}
                <span className="text-base-medium">/month</span>
              </div>
              <p className="text-muted-foreground text-xs">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li
                  className="flex items-center gap-2 text-sm font-normal"
                  key={feature}
                >
                  <IconCircleCheck />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              isLoading={isLoading === plan.value}
              onClick={() => !isActive && handlePayment(plan.value)}
              variant={isActive ? 'secondary' : 'default'}
            >
              {isActive ? (
                <span>Current Plan</span>
              ) : (
                <span>Switch to {plan.name}</span>
              )}
            </Button>
          </div>
        );
      })}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}

export default Plans;
