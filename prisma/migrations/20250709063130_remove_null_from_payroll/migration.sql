/*
  Warnings:

  - Made the column `code` on table `dt_payroll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `month` on table `dt_payroll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `base_salary` on table `dt_payroll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `work_day` on table `dt_payroll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `allowance` on table `dt_payroll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `overtime_salary` on table `dt_payroll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `late_fine` on table `dt_payroll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_salary` on table `dt_payroll` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dt_payroll" ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "month" SET NOT NULL,
ALTER COLUMN "base_salary" SET NOT NULL,
ALTER COLUMN "work_day" SET NOT NULL,
ALTER COLUMN "allowance" SET NOT NULL,
ALTER COLUMN "overtime_salary" SET NOT NULL,
ALTER COLUMN "late_fine" SET NOT NULL,
ALTER COLUMN "total_salary" SET NOT NULL;
