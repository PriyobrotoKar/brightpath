/*
  Warnings:

  - The values [VERIFIED,INVALID,INITIATED,CANCELLED,FAILED] on the enum `MerchantStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MerchantStatus_new" AS ENUM ('IN_BANK_VALIDATION', 'BANK_VALIDATION_FAILED', 'IN_BENE_CREATION', 'BENE_CREATION_FAILED', 'IN_KYC_REVIEW', 'ACTION_REQUIRED', 'ACTIVE', 'ON_HOLD', 'BLOCKED', 'DELETED');
ALTER TABLE "Merchant" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Merchant" ALTER COLUMN "status" TYPE "MerchantStatus_new" USING ("status"::text::"MerchantStatus_new");
ALTER TYPE "MerchantStatus" RENAME TO "MerchantStatus_old";
ALTER TYPE "MerchantStatus_new" RENAME TO "MerchantStatus";
DROP TYPE "MerchantStatus_old";
ALTER TABLE "Merchant" ALTER COLUMN "status" SET DEFAULT 'IN_BENE_CREATION';
COMMIT;

-- AlterTable
ALTER TABLE "Merchant" ALTER COLUMN "status" SET DEFAULT 'IN_BENE_CREATION';
