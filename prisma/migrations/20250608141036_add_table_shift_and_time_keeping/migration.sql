-- CreateTable
CREATE TABLE "dt_shift" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50),
    "name" VARCHAR(200),
    "start_time" TIMESTAMPTZ(0),
    "end_time" TIMESTAMPTZ(0),
    "working_hours" INTEGER,
    "delay_time" TIMESTAMPTZ(0),
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dt_time_keeping" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50),
    "check_in_time" TIMESTAMPTZ(0),
    "check_out_time" TIMESTAMPTZ(0),
    "date" TIMESTAMPTZ(0),
    "status" VARCHAR(50),
    "user_code" VARCHAR(50),
    "working_schedule_code" VARCHAR(50),
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_time_keeping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_shift_code_key" ON "dt_shift"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dt_time_keeping_code_key" ON "dt_time_keeping"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dt_time_keeping_working_schedule_code_key" ON "dt_time_keeping"("working_schedule_code");

-- AddForeignKey
ALTER TABLE "dt_working_schedule" ADD CONSTRAINT "dt_working_schedule_shift_code_fkey" FOREIGN KEY ("shift_code") REFERENCES "dt_shift"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_working_schedule" ADD CONSTRAINT "dt_working_schedule_code_fkey" FOREIGN KEY ("code") REFERENCES "dt_time_keeping"("working_schedule_code") ON DELETE SET NULL ON UPDATE CASCADE;
