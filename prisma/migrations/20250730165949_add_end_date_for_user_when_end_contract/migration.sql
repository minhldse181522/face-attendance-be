-- AlterTable
ALTER TABLE "dt_user_contract" ADD COLUMN     "end_date" TIMESTAMPTZ(0);

-- AlterTable
ALTER TABLE "dt_working_schedule" ALTER COLUMN "note" SET DATA TYPE VARCHAR(200);
