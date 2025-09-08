const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('dev.db');

// Проверяем, существует ли таблица reviews
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='reviews'", (err, rows) => {
  if (err) {
    console.error('Error checking table:', err);
    return;
  }
  
  console.log('Reviews table exists:', rows.length > 0);
  
  if (rows.length === 0) {
    console.log('Creating reviews table...');
    
    // Создаем таблицу отзывов
    const createTableSQL = `
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
    `;
    
    db.exec(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Reviews table created successfully!');
        
        // Создаем индексы
        const createIndexesSQL = `
          CREATE INDEX IF NOT EXISTS "reviews_clinic_id_idx" ON "reviews"("clinic_id");
          CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews"("status");
          CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews"("created_at");
        `;
        
        db.exec(createIndexesSQL, (err) => {
          if (err) {
            console.error('Error creating indexes:', err);
          } else {
            console.log('Indexes created successfully!');
          }
          db.close();
        });
      }
    });
  } else {
    console.log('Reviews table already exists');
    db.close();
  }
});
