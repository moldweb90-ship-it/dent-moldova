-- Create reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinic_id" varchar NOT NULL REFERENCES "clinics"("id") ON DELETE CASCADE,
  "author_name" varchar(255),
  "author_email" varchar(255),
  "author_phone" varchar(50),
  "quality_rating" decimal(2,1) NOT NULL,
  "service_rating" decimal(2,1) NOT NULL,
  "comfort_rating" decimal(2,1) NOT NULL,
  "price_rating" decimal(2,1) NOT NULL,
  "average_rating" decimal(2,1) NOT NULL,
  "comment" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "approved_at" timestamp,
  "rejected_at" timestamp
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "reviews_clinic_id_idx" ON "reviews"("clinic_id");
CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews"("status");
CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews"("created_at");
