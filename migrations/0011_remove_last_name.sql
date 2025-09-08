-- Remove last_name column from bookings table
ALTER TABLE bookings DROP COLUMN IF EXISTS last_name;

