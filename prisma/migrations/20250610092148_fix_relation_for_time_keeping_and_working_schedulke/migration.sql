-- DropForeignKey
ALTER TABLE "dt_working_schedule" DROP CONSTRAINT "dt_working_schedule_code_fkey";

-- AddForeignKey
ALTER TABLE "dt_time_keeping" ADD CONSTRAINT "dt_time_keeping_working_schedule_code_fkey" FOREIGN KEY ("working_schedule_code") REFERENCES "dt_working_schedule"("code") ON DELETE SET NULL ON UPDATE CASCADE;
