-- Migration: Add new clinic requests table
-- Created: 2025-01-15

CREATE TABLE IF NOT EXISTS new_clinic_requests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  website TEXT,
  specializations TEXT[],
  description TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_new_clinic_requests_status ON new_clinic_requests(status);
CREATE INDEX IF NOT EXISTS idx_new_clinic_requests_created_at ON new_clinic_requests(created_at DESC);
