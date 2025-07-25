-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_account_id_key" ON "Merchant"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_product_id_key" ON "Merchant"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_creatorId_key" ON "Merchant"("creatorId");

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
