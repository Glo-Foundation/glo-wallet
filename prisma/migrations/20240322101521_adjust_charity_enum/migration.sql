/*
  Warnings:

  - The values [GIVE_DIRECTLY,ONE_TREE_PLANTED,GITCOIN_GRANTS,OPTIMISM_RETROPGF] on the enum `Charity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Charity_new" AS ENUM ('EXTREME_POVERTY', 'OPEN_SOURCE', 'CLIMATE', 'REFUGEE_CRISIS');
ALTER TABLE "CharityChoice" ALTER COLUMN "name" TYPE "Charity_new" USING ("name"::text::"Charity_new");
ALTER TYPE "Charity" RENAME TO "Charity_old";
ALTER TYPE "Charity_new" RENAME TO "Charity";
DROP TYPE "Charity_old";
COMMIT;
