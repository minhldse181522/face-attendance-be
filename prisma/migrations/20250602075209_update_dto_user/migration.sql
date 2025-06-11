-- AlterTable
ALTER TABLE "dt_user" ALTER COLUMN "managed_by" DROP NOT NULL,
ALTER COLUMN "position_code" DROP NOT NULL,
ALTER COLUMN "address_code" DROP NOT NULL;
