/*
  Warnings:

  - You are about to drop the column `vendorCustomerId` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Order_vendorCustomerId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "vendorCustomerId";
