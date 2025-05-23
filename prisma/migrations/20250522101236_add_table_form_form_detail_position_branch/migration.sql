/*
  Warnings:

  - Added the required column `position_code` to the `dt_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "dt_user_branch_code_key";

-- AlterTable
ALTER TABLE "dt_user" ADD COLUMN     "position_code" VARCHAR(50) NOT NULL,
ALTER COLUMN "contract" DROP NOT NULL,
ALTER COLUMN "face_img" DROP NOT NULL,
ALTER COLUMN "is_active" DROP NOT NULL;

-- CreateTable
CREATE TABLE "dt_form" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "role_permission" VARCHAR(20) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dt_form_detail" (
    "id" BIGSERIAL NOT NULL,
    "form_code" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "reason" VARCHAR(200) NOT NULL,
    "file_evidence" VARCHAR(200),
    "start_time" TIMESTAMPTZ(3) NOT NULL,
    "end_time" TIMESTAMPTZ(3) NOT NULL,
    "branch_name" VARCHAR(200) NOT NULL,
    "approved_by" VARCHAR(20) NOT NULL,
    "approved_time" TIMESTAMPTZ(3) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_form_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dt_position" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "position_name" VARCHAR(200) NOT NULL,
    "basic_salary" DECIMAL(18,0) NOT NULL,
    "allowance" DECIMAL(18,0) NOT NULL,
    "overtime_salary" DECIMAL(18,0),
    "late_fee" DECIMAL(18,0),
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_form_code_key" ON "dt_form"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dt_position_code_key" ON "dt_position"("code");

-- AddForeignKey
ALTER TABLE "dt_form_detail" ADD CONSTRAINT "dt_form_detail_form_code_fkey" FOREIGN KEY ("form_code") REFERENCES "dt_form"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_user" ADD CONSTRAINT "dt_user_position_code_fkey" FOREIGN KEY ("position_code") REFERENCES "dt_position"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
