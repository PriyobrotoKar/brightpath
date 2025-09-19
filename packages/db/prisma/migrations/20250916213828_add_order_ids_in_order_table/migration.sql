/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vendorOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vendorCustomerId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorCustomerId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorOrderId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "vendorCustomerId" TEXT NOT NULL,
ADD COLUMN     "vendorOrderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_vendorOrderId_key" ON "Order"("vendorOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_vendorCustomerId_key" ON "Order"("vendorCustomerId");
