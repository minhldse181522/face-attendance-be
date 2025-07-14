/*
  Warnings:

  - The `actual_salary` column on the `dt_payroll` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "dt_payroll" DROP COLUMN "actual_salary",
ADD COLUMN     "actual_salary" DOUBLE PRECISION;
