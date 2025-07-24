/*
  Warnings:

  - You are about to alter the column `working_hours` on the `dt_shift` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "dt_shift" ALTER COLUMN "working_hours" SET DATA TYPE DECIMAL(10,2);
