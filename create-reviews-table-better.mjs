import Database from 'better-sqlite3';

async function createReviewsTable() {
  try {
    console.log('🔍 Создаем таблицу reviews...');
    
    const sqlite = new Database('dev.db');
    
    // Проверяем, существует ли таблица reviews
    const tableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='reviews'").get();
    
    if (tableExists) {
      console.log('✅ Таблица reviews уже существует');
      sqlite.close();
      return;
    }
    
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
    
    sqlite.exec(createTableSQL);
    console.log('✅ Таблица reviews создана успешно!');
    
    // Создаем индексы
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS "reviews_clinic_id_idx" ON "reviews"("clinic_id");
      CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews"("status");
      CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews"("created_at");
    `;
    
    sqlite.exec(createIndexesSQL);
    console.log('✅ Индексы созданы успешно!');
    
    // Проверяем структуру созданной таблицы
    const reviewColumns = sqlite.prepare("PRAGMA table_info(reviews)").all();
    console.log('📋 Структура таблицы reviews:');
    reviewColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Ошибка при создании таблицы:', error);
  }
}

createReviewsTable();
