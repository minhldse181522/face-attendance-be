-- CreateTable
CREATE TABLE "dt_branch" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "branch_name" VARCHAR(200) NOT NULL,
    "address_line" VARCHAR(200) NOT NULL,
    "place_id" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "lat" INTEGER NOT NULL,
    "long" INTEGER NOT NULL,
    "company_code" VARCHAR(20) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dt_user_branch" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "user_code" VARCHAR(50) NOT NULL,
    "branch_code" VARCHAR(50) NOT NULL,
    "user_contract_code" VARCHAR(50),

    CONSTRAINT "dt_user_branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dt_user_contract" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50),
    "title" VARCHAR(100),
    "description" VARCHAR(2000),
    "start_time" TIMESTAMPTZ(0),
    "end_time" TIMESTAMPTZ(0),
    "duration" VARCHAR(50),
    "contract_pdf" VARCHAR(200),
    "status" VARCHAR(50),
    "user_code" VARCHAR(200),
    "user_branch_code" VARCHAR(200),
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_user_contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dt_working_schedule" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50),
    "user_code" VARCHAR(200),
    "user_branch_code" VARCHAR(200),
    "date" TIMESTAMPTZ(0),
    "shift_code" VARCHAR(50),
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_working_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_branch_code_key" ON "dt_branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dt_user_branch_code_key" ON "dt_user_branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dt_user_contract_code_key" ON "dt_user_contract"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dt_working_schedule_code_key" ON "dt_working_schedule"("code");

-- AddForeignKey
ALTER TABLE "dt_user_branch" ADD CONSTRAINT "dt_user_branch_branch_code_fkey" FOREIGN KEY ("branch_code") REFERENCES "dt_branch"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_user_branch" ADD CONSTRAINT "dt_user_branch_user_code_fkey" FOREIGN KEY ("user_code") REFERENCES "dt_user"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_user_branch" ADD CONSTRAINT "dt_user_branch_user_contract_code_fkey" FOREIGN KEY ("user_contract_code") REFERENCES "dt_user_contract"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_user_contract" ADD CONSTRAINT "dt_user_contract_user_code_fkey" FOREIGN KEY ("user_code") REFERENCES "dt_user"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_working_schedule" ADD CONSTRAINT "dt_working_schedule_user_code_fkey" FOREIGN KEY ("user_code") REFERENCES "dt_user"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_working_schedule" ADD CONSTRAINT "dt_working_schedule_user_branch_code_fkey" FOREIGN KEY ("user_branch_code") REFERENCES "dt_user_branch"("code") ON DELETE SET NULL ON UPDATE CASCADE;
