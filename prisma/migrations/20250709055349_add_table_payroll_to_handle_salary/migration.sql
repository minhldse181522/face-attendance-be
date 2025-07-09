-- CreateTable
CREATE TABLE "dt_payroll" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50),
    "user_code" VARCHAR(50) NOT NULL,
    "month" VARCHAR(5),
    "base_salary" DOUBLE PRECISION,
    "deduction_fee" DOUBLE PRECISION,
    "work_day" INTEGER,
    "allowance" DOUBLE PRECISION,
    "overtime_salary" DOUBLE PRECISION,
    "late_fine" DOUBLE PRECISION,
    "other_fee" DOUBLE PRECISION,
    "total_salary" DOUBLE PRECISION,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_payroll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_payroll_code_key" ON "dt_payroll"("code");

-- AddForeignKey
ALTER TABLE "dt_payroll" ADD CONSTRAINT "dt_payroll_user_code_fkey" FOREIGN KEY ("user_code") REFERENCES "dt_user"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
