/*
  Warnings:

  - You are about to drop the column `profilePicuture` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePicuture",
ADD COLUMN     "profilePicture" TEXT;
