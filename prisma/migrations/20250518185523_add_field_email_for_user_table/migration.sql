/*
  Warnings:

  - Added the required column `email` to the `dt_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dt_user" ADD COLUMN     "email" VARCHAR(50) NOT NULL;
