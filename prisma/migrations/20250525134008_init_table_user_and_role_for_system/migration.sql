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
    "code" VARCHAR(50) NOT NULL,
    "user_name" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "face_img" VARCHAR(200),
    "dob" TIMESTAMPTZ(3) NOT NULL,
    "gender" VARCHAR(2) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "type_of_work" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "managed_by" VARCHAR(50) NOT NULL,
    "role_code" VARCHAR(5) NOT NULL,
    "position_code" VARCHAR(50) NOT NULL,
    "address_code" VARCHAR(20) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_role_role_code_key" ON "dt_role"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "dt_user_code_key" ON "dt_user"("code");

-- AddForeignKey
ALTER TABLE "dt_user" ADD CONSTRAINT "dt_user_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "dt_role"("role_code") ON DELETE RESTRICT ON UPDATE CASCADE;
