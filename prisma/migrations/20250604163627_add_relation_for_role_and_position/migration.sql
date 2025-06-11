/*
  Warnings:

  - Made the column `role` on table `dt_position` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dt_position" ALTER COLUMN "role" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "dt_position" ADD CONSTRAINT "dt_position_role_fkey" FOREIGN KEY ("role") REFERENCES "dt_role"("role_code") ON DELETE RESTRICT ON UPDATE CASCADE;
