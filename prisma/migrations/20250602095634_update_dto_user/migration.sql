/*
  Warnings:

  - You are about to drop the column `user_branch_code` on the `dt_user_contract` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_name]` on the table `dt_user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dt_user_contract" DROP COLUMN "user_branch_code";

-- CreateIndex
CREATE UNIQUE INDEX "dt_user_user_name_key" ON "dt_user"("user_name");

-- AddForeignKey
ALTER TABLE "dt_user_contract" ADD CONSTRAINT "dt_user_contract_managed_by_fkey" FOREIGN KEY ("managed_by") REFERENCES "dt_user"("user_name") ON DELETE SET NULL ON UPDATE CASCADE;
