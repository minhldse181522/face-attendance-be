-- CreateTable
CREATE TABLE "dt_form" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "role_code" VARCHAR(5) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_form_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dt_form" ADD CONSTRAINT "dt_form_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "dt_role"("role_code") ON DELETE RESTRICT ON UPDATE CASCADE;
