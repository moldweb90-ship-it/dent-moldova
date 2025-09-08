-- Drop the existing foreign key constraint
ALTER TABLE "clinics" DROP CONSTRAINT IF EXISTS "clinics_district_id_districts_id_fk";

-- Make district_id nullable (if not already)
ALTER TABLE "clinics" ALTER COLUMN "district_id" DROP NOT NULL;

-- Add the new foreign key constraint that allows NULL values
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_district_id_districts_id_fk" 
FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") 
ON DELETE SET NULL ON UPDATE NO ACTION;

-- Verify the constraint allows NULL values
-- This is the key part: PostgreSQL foreign key constraints automatically allow NULL values
-- unless explicitly specified otherwise
ALTER TABLE "clinics" DROP CONSTRAINT IF EXISTS "clinics_district_id_districts_id_fk";

-- Make district_id nullable (if not already)
ALTER TABLE "clinics" ALTER COLUMN "district_id" DROP NOT NULL;

-- Add the new foreign key constraint that allows NULL values
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_district_id_districts_id_fk" 
FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") 
ON DELETE SET NULL ON UPDATE NO ACTION;

-- Verify the constraint allows NULL values
-- This is the key part: PostgreSQL foreign key constraints automatically allow NULL values
-- unless explicitly specified otherwise
