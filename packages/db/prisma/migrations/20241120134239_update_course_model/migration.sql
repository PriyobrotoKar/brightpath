/*
  Warnings:

  - You are about to drop the column `banner` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "banner",
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "thumbnails" TEXT[];
