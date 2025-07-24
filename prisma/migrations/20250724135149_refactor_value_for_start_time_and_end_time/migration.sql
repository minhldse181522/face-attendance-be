/*
  Warnings:

  - The `start_time` column on the `dt_shift` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `end_time` column on the `dt_shift` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "dt_shift" DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIMESTAMPTZ(0),
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIMESTAMPTZ(0);
