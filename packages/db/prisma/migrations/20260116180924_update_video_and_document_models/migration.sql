-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "completedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "completedCount" INTEGER NOT NULL DEFAULT 0;
