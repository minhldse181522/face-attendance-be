/*
  Warnings:

  - A unique constraint covering the columns `[role_code]` on the table `dt_position` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role_code` to the `dt_position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dt_position" ADD COLUMN     "role_code" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "dt_position_role_code_key" ON "dt_position"("role_code");

-- AddForeignKey
ALTER TABLE "dt_position" ADD CONSTRAINT "dt_position_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "dt_role"("role_code") ON DELETE RESTRICT ON UPDATE CASCADE;
