-- Add language field to services table
ALTER TABLE services ADD COLUMN language VARCHAR(2) NOT NULL DEFAULT 'ru';

-- Create index for better performance
CREATE INDEX idx_services_clinic_language ON services(clinic_id, language);
