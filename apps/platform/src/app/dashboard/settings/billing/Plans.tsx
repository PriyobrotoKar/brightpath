import { Button } from '@brightpath/ui/components/button';
import { IconCircleCheck } from '@tabler/icons-react';
import React from 'react';

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
}

const plans: Plan[] = [
  {
    name: 'Starter Plan',
    price: 49,
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
    price: 99,
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
    price: 199,
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

function Plans(): React.JSX.Element {
  return (
    <div className="bg-card flex gap-4 rounded-lg border p-2">
      {plans.map((plan) => (
        <div className="flex-1 space-y-5 p-4" key={plan.name}>
          <div className="space-y-1">
            <h3 className="text-sm">{plan.name}</h3>
            <div className="text-xl">
              ${plan.price}
              <span className="text-base-medium">/month</span>
            </div>
            <p className="text-xs">{plan.description}</p>
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

          <Button>Switch to {plan.name}</Button>
        </div>
      ))}
    </div>
  );
}

export default Plans;
