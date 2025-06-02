/*
  Warnings:

  - You are about to drop the column `user_code` on the `dt_user_branch` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `dt_user_branch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dt_user_branch" DROP CONSTRAINT "dt_user_branch_user_code_fkey";

-- DropForeignKey
ALTER TABLE "dt_working_schedule" DROP CONSTRAINT "dt_working_schedule_user_branch_code_fkey";

-- AlterTable
ALTER TABLE "dt_user_branch" DROP COLUMN "user_code",
ADD COLUMN     "created_by" VARCHAR(36) NOT NULL,
ADD COLUMN     "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modified_by" VARCHAR(36),
ADD COLUMN     "modified_date" TIMESTAMPTZ(3);

-- AddForeignKey
ALTER TABLE "dt_working_schedule" ADD CONSTRAINT "dt_working_schedule_user_branch_code_fkey" FOREIGN KEY ("user_branch_code") REFERENCES "dt_user_contract"("code") ON DELETE SET NULL ON UPDATE CASCADE;
