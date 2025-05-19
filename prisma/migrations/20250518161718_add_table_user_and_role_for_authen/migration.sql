-- CreateTable
CREATE TABLE "dt_role" (
    "id" BIGSERIAL NOT NULL,
    "role_code" VARCHAR(5) NOT NULL,
    "role_name" VARCHAR(20) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dt_user" (
    "id" BIGSERIAL NOT NULL,
    "user_name" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "role_code" VARCHAR(5) NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "bod" TIMESTAMPTZ(3) NOT NULL,
    "address" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_role_role_code_key" ON "dt_role"("role_code");

-- AddForeignKey
ALTER TABLE "dt_user" ADD CONSTRAINT "dt_user_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "dt_role"("role_code") ON DELETE RESTRICT ON UPDATE CASCADE;
