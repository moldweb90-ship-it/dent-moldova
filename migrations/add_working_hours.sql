-- Migration: Add working hours table
-- Created: 2025-01-19

CREATE TABLE IF NOT EXISTS "working_hours" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinic_id" varchar NOT NULL REFERENCES "clinics"("id") ON DELETE CASCADE,
  "day_of_week" integer NOT NULL,
  "is_open" boolean NOT NULL DEFAULT true,
  "open_time" varchar,
  "close_time" varchar,
  "break_start_time" varchar,
  "break_end_time" varchar,
  "is_24_hours" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "working_hours_clinic_id_idx" ON "working_hours"("clinic_id");
CREATE INDEX IF NOT EXISTS "working_hours_day_of_week_idx" ON "working_hours"("day_of_week");

-- Add comment
COMMENT ON TABLE "working_hours" IS 'Working hours for clinics';
COMMENT ON COLUMN "working_hours"."day_of_week" IS '0 = Sunday, 1 = Monday, ..., 6 = Saturday';
COMMENT ON COLUMN "working_hours"."open_time" IS 'Format: HH:MM (e.g., 09:00)';
COMMENT ON COLUMN "working_hours"."close_time" IS 'Format: HH:MM (e.g., 18:00)';
COMMENT ON COLUMN "working_hours"."break_start_time" IS 'Format: HH:MM (e.g., 13:00) - optional lunch break';
COMMENT ON COLUMN "working_hours"."break_end_time" IS 'Format: HH:MM (e.g., 14:00) - optional lunch break';





























