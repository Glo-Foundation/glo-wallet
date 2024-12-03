/*
  Warnings:

  - You are about to drop the `CachedFundingChoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CachedFundingChoice";

-- CreateTable
CREATE TABLE "FundingChoicesCache" (
    "id" SERIAL NOT NULL,
    "choices" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundingChoicesCache_pkey" PRIMARY KEY ("id")
);
