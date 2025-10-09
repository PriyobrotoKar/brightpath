/*
  Warnings:

  - Added the required column `logo` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "logo" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
