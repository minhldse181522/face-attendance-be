/*
  Warnings:

  - The `lunch_break` column on the `dt_shift` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "dt_shift" DROP COLUMN "lunch_break",
ADD COLUMN     "lunch_break" VARCHAR(10);
