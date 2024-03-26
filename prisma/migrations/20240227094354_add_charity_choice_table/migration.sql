-- CreateEnum
CREATE TYPE "Charity" AS ENUM ('GIVE_DIRECTLY', 'ONE_TREE_PLANTED', 'GITCOIN_GRANTS', 'OPTIMISM_RETROPGF');

-- CreateTable
CREATE TABLE "CharityChoice" (
    "id" SERIAL NOT NULL,
    "name" "Charity" NOT NULL,
    "address" TEXT NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "percent" INTEGER NOT NULL,
    "choiceNum" INTEGER NOT NULL,

    CONSTRAINT "CharityChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharityChoice_address_choiceNum_name_key" ON "CharityChoice"("address", "choiceNum", "name");
