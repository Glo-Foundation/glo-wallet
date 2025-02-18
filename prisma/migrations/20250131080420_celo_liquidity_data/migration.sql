-- CreateTable
CREATE TABLE "CeloLiquidity" (
    "id" SERIAL NOT NULL,
    "total" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CeloLiquidity_pkey" PRIMARY KEY ("id")
);
