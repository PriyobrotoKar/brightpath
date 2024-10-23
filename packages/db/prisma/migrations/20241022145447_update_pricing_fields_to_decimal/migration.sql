/*
  Warnings:

  - The `discountValue` column on the `Pricing` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `discountValue` on the `Coupon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `price` on the `Pricing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "discountValue",
ADD COLUMN     "discountValue" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "Pricing" DROP COLUMN "price",
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL,
DROP COLUMN "discountValue",
ADD COLUMN     "discountValue" DECIMAL(65,30);
