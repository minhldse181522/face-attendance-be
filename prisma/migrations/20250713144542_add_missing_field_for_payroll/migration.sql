-- AlterTable
ALTER TABLE "dt_payroll" ADD COLUMN     "paid_date" TIMESTAMPTZ(3),
ADD COLUMN     "status" VARCHAR(20),
ADD COLUMN     "total_work_hour" DOUBLE PRECISION;
