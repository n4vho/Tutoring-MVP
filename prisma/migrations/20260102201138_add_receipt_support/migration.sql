-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "receiptIssuedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "receiptNo" TEXT;

-- CreateTable
CREATE TABLE "ReceiptCounter" (
    "monthKey" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptCounter_pkey" PRIMARY KEY ("monthKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receiptNo_key" ON "Payment"("receiptNo");

-- CreateIndex
CREATE INDEX "Payment_receiptNo_idx" ON "Payment"("receiptNo");

