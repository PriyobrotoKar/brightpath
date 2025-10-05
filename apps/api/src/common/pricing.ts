import { Currency, Pricing, Prisma } from '@brightpath/db';
import { LoggerService } from '@nestjs/common';

export function calcuateCostVariables(
  pricing: Pricing,
  courseSlug: string,
  logger: LoggerService,
) {
  logger.log(
    `Calculating cost variables for course: ${courseSlug} with pricing: ${pricing.price}`,
  );

  let discount = pricing.discountEnabled ? new Prisma.Decimal(0) : null;
  let totalAmount = pricing.price;

  // calculate discounts if enabled
  if (pricing.discountEnabled) {
    if (pricing.discountType === 'PERCENTAGE') {
      discount = pricing.price.mul(pricing.discountValue).div(100);

      logger.log(
        `Discount of ${pricing.discountValue.toNumber()} percentage = ${discount} is applied`,
      );
    }

    if (pricing.discountType === 'AMOUNT') {
      discount = pricing.discountValue;
      logger.log(`Discount of ${discount.toString()} amount is applied`);
    }

    discount = discount.toDecimalPlaces(2);
    totalAmount = totalAmount.sub(discount);
  }

  // calculate taxes if the merchant has GSTIN

  logger.log(
    `Total calculated amount for course: ${courseSlug} is ${totalAmount} with discount of ${discount}`,
  );

  return {
    originalAmount: pricing.price,
    discount,
    totalAmount,
    currency: Currency.INR,
  };
}
