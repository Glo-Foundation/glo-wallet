-- CreateTable
CREATE TABLE "BalanceOnDate" (
    "id" SERIAL NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "balancesData" JSONB,

    CONSTRAINT "BalanceOnDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceCharity" (
    "id" SERIAL NOT NULL,
    "runId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "balancesData" JSONB,
    "charityData" JSONB,

    CONSTRAINT "BalanceCharity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BalanceCharity" ADD CONSTRAINT "BalanceCharity_runId_fkey" FOREIGN KEY ("runId") REFERENCES "BalanceOnDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
