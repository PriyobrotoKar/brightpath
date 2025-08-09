/*
  Warnings:

  - Added the required column `merchantId` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Merchant" ADD COLUMN     "merchantId" TEXT NOT NULL DEFAULT '';
