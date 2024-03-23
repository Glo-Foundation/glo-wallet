/*
  Warnings:

  - Added the required column `sig` to the `CharityChoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sigMessage` to the `CharityChoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharityChoice" ADD COLUMN     "sig" TEXT NOT NULL,
ADD COLUMN     "sigMessage" TEXT NOT NULL;
