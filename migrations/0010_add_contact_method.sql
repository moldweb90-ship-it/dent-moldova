-- Add contact_method column to bookings table
ALTER TABLE bookings ADD COLUMN contact_method VARCHAR;

-- Add comment to explain the field
COMMENT ON COLUMN bookings.contact_method IS 'Preferred contact method: phone, email, whatsapp, telegram';
