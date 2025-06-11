-- CreateTable
CREATE TABLE "dt_position" (
    "id" BIGSERIAL NOT NULL,
    "position_code" VARCHAR(10) NOT NULL,
    "position_name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(5) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "base_salary" DOUBLE PRECISION NOT NULL,
    "allowance" DOUBLE PRECISION,
    "overtime_salary" DOUBLE PRECISION NOT NULL,
    "late_fine" DOUBLE PRECISION NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_position_position_code_key" ON "dt_position"("position_code");
