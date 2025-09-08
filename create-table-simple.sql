CREATE TABLE IF NOT EXISTS "reviews" (
  "id" TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  "clinic_id" TEXT NOT NULL REFERENCES "clinics"("id") ON DELETE CASCADE,
  "author_name" TEXT,
  "author_email" TEXT,
  "author_phone" TEXT,
  "quality_rating" REAL NOT NULL,
  "service_rating" REAL NOT NULL,
  "comfort_rating" REAL NOT NULL,
  "price_rating" REAL NOT NULL,
  "average_rating" REAL NOT NULL,
  "comment" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "approved_at" DATETIME,
  "rejected_at" DATETIME
);

CREATE INDEX IF NOT EXISTS "reviews_clinic_id_idx" ON "reviews"("clinic_id");
CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews"("status");
CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews"("created_at");
