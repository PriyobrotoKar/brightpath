-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('COHORT', 'RECORDED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "accessDuration" INTEGER,
ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "startAt" TIMESTAMP(3),
ADD COLUMN     "type" "CourseType" NOT NULL DEFAULT 'RECORDED';
