-- Add new columns as nullable, copy from costPerSlot, then make required and drop old column
ALTER TABLE "TeeTime" ADD COLUMN "coursePricePerSlot" INTEGER;
ALTER TABLE "TeeTime" ADD COLUMN "sellerPricePerSlot" INTEGER;

UPDATE "TeeTime" SET "coursePricePerSlot" = "costPerSlot", "sellerPricePerSlot" = "costPerSlot";

ALTER TABLE "TeeTime" ALTER COLUMN "coursePricePerSlot" SET NOT NULL;
ALTER TABLE "TeeTime" ALTER COLUMN "sellerPricePerSlot" SET NOT NULL;

ALTER TABLE "TeeTime" DROP COLUMN "costPerSlot";
