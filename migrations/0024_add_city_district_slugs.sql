-- Migration: Add slug fields to cities and districts
-- Created at: 2025-01-16

-- Add slug fields to cities table
ALTER TABLE "cities" ADD COLUMN IF NOT EXISTS "slug_ru" varchar(255);
ALTER TABLE "cities" ADD COLUMN IF NOT EXISTS "slug_ro" varchar(255);

-- Add slug fields to districts table  
ALTER TABLE "districts" ADD COLUMN IF NOT EXISTS "slug_ru" varchar(255);
ALTER TABLE "districts" ADD COLUMN IF NOT EXISTS "slug_ro" varchar(255);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "cities_slug_ru_idx" ON "cities"("slug_ru");
CREATE INDEX IF NOT EXISTS "cities_slug_ro_idx" ON "cities"("slug_ro");
CREATE INDEX IF NOT EXISTS "districts_slug_ru_idx" ON "districts"("slug_ru");
CREATE INDEX IF NOT EXISTS "districts_slug_ro_idx" ON "districts"("slug_ro");
