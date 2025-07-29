/*
  Warnings:

  - You are about to drop the column `account_id` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `Merchant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('VERIFIED', 'INVALID', 'INITIATED', 'CANCELLED', 'FAILED', 'DELETED');

-- DropIndex
DROP INDEX "Merchant_account_id_key";

-- DropIndex
DROP INDEX "Merchant_product_id_key";

-- AlterTable
ALTER TABLE "Merchant" DROP COLUMN "account_id",
DROP COLUMN "product_id",
ADD COLUMN     "status" "MerchantStatus" NOT NULL DEFAULT 'INITIATED';
