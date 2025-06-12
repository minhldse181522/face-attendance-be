-- CreateTable
CREATE TABLE "dt_face_reference" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "face_img" VARCHAR(200) NOT NULL,
    "user_code" VARCHAR(50) NOT NULL,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_face_reference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dt_face_reference_code_key" ON "dt_face_reference"("code");

-- AddForeignKey
ALTER TABLE "dt_face_reference" ADD CONSTRAINT "dt_face_reference_user_code_fkey" FOREIGN KEY ("user_code") REFERENCES "dt_user"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
