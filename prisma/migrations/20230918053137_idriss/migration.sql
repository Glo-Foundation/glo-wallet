-- CreateTable
CREATE TABLE "IdrissInvite" (
    "address" TEXT NOT NULL,

    CONSTRAINT "IdrissInvite_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdrissInvite_address_key" ON "IdrissInvite"("address");
