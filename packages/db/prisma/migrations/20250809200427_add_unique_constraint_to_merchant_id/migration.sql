/*
  Warnings:

  - A unique constraint covering the columns `[merchantId]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Merchant_merchantId_key" ON "public"."Merchant"("merchantId");
