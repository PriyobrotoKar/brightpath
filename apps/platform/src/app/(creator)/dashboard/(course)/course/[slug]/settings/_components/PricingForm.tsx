'use client';
import type { Coupon } from '@brightpath/db';
import { DiscountType, PaymentPlan } from '@brightpath/db';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '@brightpath/ui/components/radio-group';
import { Switch } from '@brightpath/ui/components/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@brightpath/ui/components/button';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@brightpath/ui/lib/utils';
import { toast } from '@brightpath/ui/components/sonner';
import { useMutation } from '@tanstack/react-query';
import type {
  CoursePricingResponse,
  UpdateCoursePricingPayload,
} from '@/api/services/course';
import { updateCoursePricing } from '@/api/services/course';
import FormInfo from '@/app/(creator)/dashboard/(lobby)/course/create/_components/FormInfo';

const pricingSchema = z.object({
  model: z.nativeEnum(PaymentPlan).optional(),
  price: z.number().optional(),
  discount_enabled: z.boolean().optional(),
  discount_type: z.nativeEnum(DiscountType).optional(),
  discount_value: z.number().optional(),
  coupon_enabled: z.boolean().optional(),
  coupon_type: z.nativeEnum(DiscountType).optional(),
  coupon_value: z.number().optional(),
  coupon_code: z.string().optional(),
});

interface PricingFormProps {
  pricing: CoursePricingResponse;
  coupons: Coupon[];
}

export default function PricingForm({
  pricing,
  coupons,
}: PricingFormProps): React.JSX.Element {
  const courseId = pricing.courseId;

  const form = useForm<z.infer<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      model: pricing.paymentPlan,
      price: Number(pricing.originalAmount),
      discount_enabled: pricing.discountEnabled,
      discount_value: Number(pricing.discountValue),
      discount_type: pricing.discountType ?? undefined,
      coupon_enabled: coupons.length > 0,
      coupon_type: coupons[0]?.discountType,
      coupon_value: coupons[0]?.discountValue.toNumber(),
      coupon_code: coupons[0]?.code,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UpdateCoursePricingPayload) => {
      return updateCoursePricing(courseId, data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Course pricing updated successfully');
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (data.model !== PaymentPlan.FREE && !data.price) {
      form.setError(
        'price',
        {
          type: 'manual',
          message: 'Price is required for paid plans',
        },
        {
          shouldFocus: true,
        },
      );
      return;
    }

    if (data.discount_enabled) {
      if (!data.discount_value) {
        form.setError(
          'discount_value',
          {
            type: 'manual',
            message: 'Discount value is required',
          },
          {
            shouldFocus: true,
          },
        );

        return;
      }

      if (!data.discount_type) {
        form.setError(
          'discount_type',
          {
            type: 'manual',
            message: 'Discount type is required',
          },
          {
            shouldFocus: true,
          },
        );
        return;
      }

      if (data.discount_type === 'PERCENTAGE' && data.discount_value > 100) {
        form.setError(
          'discount_value',
          {
            type: 'manual',
            message: 'Discount value must be less than or equal to 100',
          },
          {
            shouldFocus: true,
          },
        );
        return;
      }
    }

    if (data.coupon_enabled && !data.coupon_value) {
      form.setError(
        'coupon_value',
        {
          type: 'manual',
          message: 'Coupon value is required',
        },
        {
          shouldFocus: true,
        },
      );
      return;
    }

    if (data.coupon_enabled && !data.coupon_type) {
      form.setError(
        'coupon_type',
        {
          type: 'manual',
          message: 'Coupon type is required',
        },
        {
          shouldFocus: true,
        },
      );
      return;
    }
    if (data.coupon_enabled && !data.coupon_code) {
      form.setError(
        'coupon_code',
        {
          type: 'manual',
          message: 'Coupon code is required',
        },
        {
          shouldFocus: true,
        },
      );
      return;
    }

    if (data.model === PaymentPlan.FREE) {
      data.price = 0;
    }

    if (!data.discount_enabled) {
      data.discount_type = undefined;
      data.discount_value = undefined;
    }
    if (!data.coupon_enabled) {
      data.coupon_type = undefined;
      data.coupon_value = undefined;
    }

    mutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form className="flex flex-1 flex-col gap-6" onSubmit={onSubmit}>
        <div className="max-w-screen-sm flex-1 space-y-6">
          <FormField
            name="model"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Pricing Model</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                        <FormControl>
                          <RadioGroupItem hidden value={PaymentPlan.FREE} />
                        </FormControl>
                        <FormLabel className="flex items-center gap-4 p-4">
                          <div>
                            <Image
                              alt="Free Plan"
                              height={48}
                              src="/illustrations/free.svg"
                              width={48}
                            />
                          </div>
                          <div>
                            <div className="text-md-semibold">Free</div>
                            <div className="text-muted-foreground text-xs">
                              Allow access to your content free of charge
                            </div>
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                        <FormControl>
                          <RadioGroupItem hidden value={PaymentPlan.ONETIME} />
                        </FormControl>
                        <FormLabel className="flex items-center gap-4 p-4">
                          <div>
                            <Image
                              alt="One Time Plan"
                              height={48}
                              src="/illustrations/one-time.svg"
                              width={48}
                            />
                          </div>
                          <div>
                            <div className="text-md-semibold">
                              One-time Payment
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Set up a one time payment
                            </div>
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                        <FormControl>
                          <RadioGroupItem
                            hidden
                            value={PaymentPlan.RECURRING}
                          />
                        </FormControl>
                        <FormLabel className="flex items-center gap-4 p-4">
                          <div>
                            <Image
                              alt="Recurring Plan"
                              height={48}
                              src="/illustrations/recurring.svg"
                              width={48}
                            />
                          </div>
                          <div>
                            <div className="text-md-semibold">Subscription</div>
                            <div className="text-muted-foreground text-xs">
                              Set up recurring payments
                            </div>
                          </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <FormField
            name="price"
            render={({ field }) => {
              const paymentPlan = form.watch('model');
              return (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        ₹
                      </span>
                      <Input
                        className="pl-6"
                        disabled={paymentPlan === 'FREE'}
                        inputMode="numeric"
                        {...field}
                        onChange={(e) => {
                          if (isNaN(Number(e.target.value))) {
                            return;
                          }
                          field.onChange(Number(e.target.value));
                        }}
                        placeholder="200"
                        type="text"
                        value={
                          paymentPlan === 'FREE' ? 0 : (field.value as string)
                        }
                      />
                      <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2">
                        INR
                      </span>
                    </div>
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <FormInfo
            subtitle="Add discounts and promotions for your students"
            title="Discount & Promotions"
          />
          <FormField
            name="discount_enabled"
            render={({ field }) => {
              return (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Discount</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              );
            }}
          />
          {form.watch('discount_enabled') && (
            <>
              <FormField
                name="discount_type"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          className="flex gap-2"
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                            <FormControl>
                              <RadioGroupItem
                                hidden
                                value={DiscountType.PERCENTAGE}
                              />
                            </FormControl>
                            <FormLabel className="block p-4">
                              <div className="text-md-semibold text-center">
                                Percentage
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                            <FormControl>
                              <RadioGroupItem
                                hidden
                                value={DiscountType.AMOUNT}
                              />
                            </FormControl>
                            <FormLabel className="block p-4">
                              <div className="text-md-semibold text-center">
                                Amount
                              </div>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                name="discount_value"
                render={({ field }) => {
                  const discountType = form.watch('discount_type');
                  return (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <div className="relative">
                          {discountType === 'AMOUNT' && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                              ₹
                            </span>
                          )}
                          <Input
                            className={cn(
                              '',
                              discountType === 'AMOUNT' && 'pl-6',
                            )}
                            inputMode="numeric"
                            placeholder={
                              discountType === 'AMOUNT' ? '200' : '20'
                            }
                            {...field}
                            onChange={(e) => {
                              if (isNaN(Number(e.target.value))) {
                                return;
                              }
                              field.onChange(Number(e.target.value));
                            }}
                            value={field.value as string}
                          />
                          <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2">
                            {discountType === 'AMOUNT' ? 'INR' : '%'}
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter value of the discount, depending on the type
                        (e.g., 20 for 20% or 50 for ₹50 off)
                      </FormDescription>
                    </FormItem>
                  );
                }}
              />
            </>
          )}

          <FormField
            name="coupon_enabled"
            render={({ field }) => {
              return (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Coupon</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              );
            }}
          />
          {form.watch('coupon_enabled') && (
            <>
              <FormField
                name="coupon_type"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          className="flex gap-2"
                          onValueChange={field.onChange}
                        >
                          <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                            <FormControl>
                              <RadioGroupItem
                                hidden
                                value={DiscountType.PERCENTAGE}
                              />
                            </FormControl>
                            <FormLabel className="block p-4">
                              <div className="text-md-semibold text-center">
                                Percentage
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                            <FormControl>
                              <RadioGroupItem
                                hidden
                                value={DiscountType.AMOUNT}
                              />
                            </FormControl>
                            <FormLabel className="block p-4">
                              <div className="text-md-semibold text-center">
                                Amount
                              </div>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                name="coupon_value"
                render={({ field }) => {
                  const discountType = form.watch('coupon_type');
                  return (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <div className="relative">
                          {discountType === 'AMOUNT' && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                              ₹
                            </span>
                          )}
                          <Input
                            className={cn(
                              '',
                              discountType === 'AMOUNT' && 'pl-6',
                            )}
                            placeholder={
                              discountType === 'AMOUNT' ? '200' : '20'
                            }
                            {...field}
                            onChange={(e) => {
                              if (isNaN(Number(e.target.value))) {
                                return;
                              }
                              field.onChange(Number(e.target.value));
                            }}
                            value={field.value as string}
                          />
                          <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2">
                            {discountType === 'AMOUNT' ? 'INR' : '%'}
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter value of the discount, depending on the type
                        (e.g., 20 for 20% or 50 for ₹50 off)
                      </FormDescription>
                    </FormItem>
                  );
                }}
              />

              <FormField
                name="coupon_code"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                          }}
                          placeholder="BOOTCAMP20"
                          value={field.value as string}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </>
          )}
        </div>
        <div className="border-border mt-auto flex items-center justify-between border-t py-4">
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
          <Button className="w-fit" isLoading={mutation.isPending} size="sm">
            Save & Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
