-- Drop the existing foreign key constraint
ALTER TABLE "clinics" DROP CONSTRAINT IF EXISTS "clinics_district_id_districts_id_fk";

-- Make district_id nullable (if not already)
ALTER TABLE "clinics" ALTER COLUMN "district_id" DROP NOT NULL;

-- Add the new foreign key constraint with ON DELETE SET NULL
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_district_id_districts_id_fk" 
FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") 
ON DELETE SET NULL ON UPDATE NO ACTION;
