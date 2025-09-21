/*
  Warnings:

  - You are about to drop the column `amount` on the `Order` table. All the data in the column will be lost.
  - Added the required column `originalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "amount",
ADD COLUMN     "discountPercentage" DECIMAL(65,30),
ADD COLUMN     "originalAmount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "taxPercentage" DECIMAL(65,30),
ADD COLUMN     "totalAmount" DECIMAL(65,30) NOT NULL;
