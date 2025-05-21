/*
  Warnings:

  - Added the required column `branch_code` to the `dt_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract` to the `dt_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `face_img` to the `dt_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managed_by` to the `dt_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dt_user" ADD COLUMN     "branch_code" VARCHAR(20) NOT NULL,
ADD COLUMN     "contract" VARCHAR(200) NOT NULL,
ADD COLUMN     "face_img" VARCHAR(200) NOT NULL,
ADD COLUMN     "managed_by" VARCHAR(50) NOT NULL;
