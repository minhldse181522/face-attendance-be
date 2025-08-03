-- CreateTable
CREATE TABLE "dt_notification" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" VARCHAR(200) NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_date" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(36) NOT NULL,
    "modified_date" TIMESTAMPTZ(3),
    "modified_by" VARCHAR(36),

    CONSTRAINT "dt_notification_pkey" PRIMARY KEY ("id")
);
