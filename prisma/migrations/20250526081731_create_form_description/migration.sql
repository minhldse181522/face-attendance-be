-- CreateTable
CREATE TABLE "dt_form_description" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "file" VARCHAR(200),
    "start_time" TIMESTAMPTZ(3) NOT NULL,
    "end_time" TIMESTAMPTZ(3) NOT NULL,
    "approved_time" TIMESTAMPTZ(3),
    "form_id" BIGINT NOT NULL,
    "submitted_by" VARCHAR(50) NOT NULL,
    "approved_by" VARCHAR(50),
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_form_description_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_form_description_code_key" ON "dt_form_description"("code");

-- AddForeignKey
ALTER TABLE "dt_form_description" ADD CONSTRAINT "dt_form_description_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "dt_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_form_description" ADD CONSTRAINT "dt_form_description_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "dt_user"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dt_form_description" ADD CONSTRAINT "dt_form_description_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "dt_user"("code") ON DELETE SET NULL ON UPDATE CASCADE;
