-- Migration: Add reviews system
-- Created at: 2025-01-19

-- Create reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinic_id" varchar NOT NULL REFERENCES "clinics"("id") ON DELETE CASCADE,
  "author_name" text NOT NULL,
  "author_email" text,
  "author_phone" text,
  "clinic_rating" integer NOT NULL,
  "doctor_rating" integer NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "visit_date" timestamp,
  "service_type" text,
  "status" varchar NOT NULL DEFAULT 'pending',
  "moderator_notes" text,
  "moderated_by" varchar,
  "moderated_at" timestamp,
  "ip_address" varchar,
  "user_agent" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create review_attachments table
CREATE TABLE IF NOT EXISTS "review_attachments" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "review_id" varchar NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
  "file_name" text NOT NULL,
  "file_url" text NOT NULL,
  "file_type" varchar NOT NULL,
  "file_size" integer,
  "created_at" timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "reviews_clinic_id_idx" ON "reviews"("clinic_id");
CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews"("status");
CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews"("created_at");
CREATE INDEX IF NOT EXISTS "review_attachments_review_id_idx" ON "review_attachments"("review_id");

