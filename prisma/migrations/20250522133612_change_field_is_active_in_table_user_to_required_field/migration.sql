/*
  Warnings:

  - Made the column `is_active` on table `dt_user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dt_user" ALTER COLUMN "is_active" SET NOT NULL;
