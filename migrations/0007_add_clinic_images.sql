-- Add images field to clinics table
ALTER TABLE clinics ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- Add comment for the new field
COMMENT ON COLUMN clinics.images IS 'Array of additional clinic image URLs';
