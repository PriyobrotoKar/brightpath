-- CreateEnum
CREATE TYPE "VideoProgressStatus" AS ENUM ('NOT_STARTED', 'IN_QUEUE', 'PROCESSING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "status" "VideoProgressStatus" NOT NULL DEFAULT 'NOT_STARTED';
