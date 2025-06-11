-- AddForeignKey
ALTER TABLE "dt_working_schedule" ADD CONSTRAINT "dt_working_schedule_branch_code_fkey" FOREIGN KEY ("branch_code") REFERENCES "dt_branch"("code") ON DELETE SET NULL ON UPDATE CASCADE;
