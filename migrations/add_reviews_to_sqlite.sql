-- Add reviews table to SQLite
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  clinic_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_phone TEXT,
  clinic_rating INTEGER NOT NULL,
  doctor_rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visit_date INTEGER,
  service_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  moderator_notes TEXT,
  moderated_by TEXT,
  moderated_at INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Add review_attachments table to SQLite
CREATE TABLE IF NOT EXISTS review_attachments (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_clinic_id ON reviews(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_attachments_review_id ON review_attachments(review_id);

