-- Add sort_order field to cities table
ALTER TABLE cities ADD COLUMN sort_order INTEGER DEFAULT 0;
