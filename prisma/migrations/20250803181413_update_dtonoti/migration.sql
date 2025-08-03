/*
  Warnings:

  - Added the required column `user_code` to the `dt_notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dt_notification" ADD COLUMN     "user_code" VARCHAR(36) NOT NULL;
