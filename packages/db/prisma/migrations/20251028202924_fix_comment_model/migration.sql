/*
  Warnings:

  - You are about to drop the column `userId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `commentId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropIndex
DROP INDEX "Comment_commentByUserId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "commentId";
