-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('EVERYONE', 'INVITE_ONLY');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "accessType" "AccessType" NOT NULL DEFAULT 'EVERYONE',
ADD COLUMN     "enrollmentDeadline" TIMESTAMP(3);
