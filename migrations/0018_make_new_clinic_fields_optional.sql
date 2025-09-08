-- Migration: Make new clinic request fields optional
-- Created: 2025-01-15

-- Make contact_email nullable
ALTER TABLE new_clinic_requests ALTER COLUMN contact_email DROP NOT NULL;

-- Make city nullable
ALTER TABLE new_clinic_requests ALTER COLUMN city DROP NOT NULL;

-- Make address nullable
ALTER TABLE new_clinic_requests ALTER COLUMN address DROP NOT NULL;

-- Make description nullable
ALTER TABLE new_clinic_requests ALTER COLUMN description DROP NOT NULL;
