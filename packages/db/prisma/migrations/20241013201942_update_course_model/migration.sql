/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Made the column `creatorId` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "creatorId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_creatorId_key" ON "Course"("creatorId");
