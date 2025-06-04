/*
  Warnings:

  - You are about to drop the column `position_code` on the `dt_position` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `dt_position` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `dt_position` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "dt_position_position_code_key";

-- AlterTable
ALTER TABLE "dt_position" DROP COLUMN "position_code",
ADD COLUMN     "code" VARCHAR(10) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "dt_position_code_key" ON "dt_position"("code");
