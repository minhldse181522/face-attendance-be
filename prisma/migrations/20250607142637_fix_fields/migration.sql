/*
  Warnings:

  - You are about to drop the column `user_branch_code` on the `dt_working_schedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "dt_working_schedule" DROP CONSTRAINT "dt_working_schedule_user_branch_code_fkey";

-- AlterTable
ALTER TABLE "dt_working_schedule" DROP COLUMN "user_branch_code",
ADD COLUMN     "user_contract_code" VARCHAR(200);

-- AddForeignKey
ALTER TABLE "dt_user_contract" ADD CONSTRAINT "dt_user_contract_position_code_fkey" FOREIGN KEY ("position_code") REFERENCES "dt_position"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_working_schedule" ADD CONSTRAINT "dt_working_schedule_user_contract_code_fkey" FOREIGN KEY ("user_contract_code") REFERENCES "dt_user_contract"("code") ON DELETE SET NULL ON UPDATE CASCADE;
