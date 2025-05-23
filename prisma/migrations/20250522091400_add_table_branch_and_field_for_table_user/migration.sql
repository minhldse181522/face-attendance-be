/*
  Warnings:

  - A unique constraint covering the columns `[branch_code]` on the table `dt_user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dt_user" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "dt_branch" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "branch_name" VARCHAR(200) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_branch_code_key" ON "dt_branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dt_user_branch_code_key" ON "dt_user"("branch_code");

-- AddForeignKey
ALTER TABLE "dt_user" ADD CONSTRAINT "dt_user_branch_code_fkey" FOREIGN KEY ("branch_code") REFERENCES "dt_branch"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
