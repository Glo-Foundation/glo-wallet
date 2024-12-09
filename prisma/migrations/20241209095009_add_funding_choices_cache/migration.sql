-- CreateTable
CREATE TABLE "FundingChoicesCache" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "choices" JSONB NOT NULL,

    CONSTRAINT "FundingChoicesCache_pkey" PRIMARY KEY ("id")
);
