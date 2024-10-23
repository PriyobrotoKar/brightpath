-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'AMOUNT');

-- AlterTable
ALTER TABLE "Pricing" ADD COLUMN     "discountEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "discountType" "DiscountType",
ADD COLUMN     "discountValue" TEXT;

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountValue" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
