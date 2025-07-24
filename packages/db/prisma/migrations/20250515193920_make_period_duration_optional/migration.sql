-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "currentPeriodEnd" DROP NOT NULL,
ALTER COLUMN "currentPeriodStart" DROP NOT NULL;
