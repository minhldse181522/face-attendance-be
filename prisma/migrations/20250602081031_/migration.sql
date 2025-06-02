/*
  Warnings:

  - You are about to drop the column `managed_by` on the `dt_user` table. All the data in the column will be lost.
  - You are about to drop the column `position_code` on the `dt_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dt_user" DROP COLUMN "managed_by",
DROP COLUMN "position_code";

-- AlterTable
ALTER TABLE "dt_user_contract" ADD COLUMN     "managed_by" VARCHAR(50),
ADD COLUMN     "position_code" VARCHAR(50);
