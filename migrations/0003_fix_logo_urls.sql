-- Update existing logo URLs from /img/ to /images/
UPDATE clinics 
SET logo_url = REPLACE(logo_url, '/img/', '/images/') 
WHERE logo_url LIKE '/img/%';
