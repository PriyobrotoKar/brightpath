/*
  Warnings:

  - You are about to drop the column `courseId` on the `Coupon` table. All the data in the column will be lost.
  - Added the required column `pricingId` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_courseId_fkey";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "courseId",
ADD COLUMN     "pricingId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_pricingId_fkey" FOREIGN KEY ("pricingId") REFERENCES "Pricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
