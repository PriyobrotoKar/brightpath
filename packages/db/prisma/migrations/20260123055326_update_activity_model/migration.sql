/*
  Warnings:

  - You are about to drop the column `createdAt` on the `UserActivity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,courseId,activityDate]` on the table `UserActivity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityDate` to the `UserActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserActivity" DROP COLUMN "createdAt",
ADD COLUMN     "activityDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserActivity_userId_courseId_activityDate_key" ON "UserActivity"("userId", "courseId", "activityDate");
