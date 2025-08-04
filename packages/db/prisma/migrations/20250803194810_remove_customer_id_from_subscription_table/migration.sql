/*
  Warnings:

  - You are about to drop the column `customerId` on the `Subscription` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Subscription_customerId_key";

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "customerId";
