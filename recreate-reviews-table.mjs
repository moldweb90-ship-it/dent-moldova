import Database from 'better-sqlite3';

async function recreateReviewsTable() {
  try {
    console.log('🔍 Пересоздаем таблицу reviews...');
    
    const sqlite = new Database('dev.db');
    
    // Удаляем старую таблицу
    console.log('🗑️ Удаляем старую таблицу reviews...');
    sqlite.exec('DROP TABLE IF EXISTS reviews');
    
    // Создаем новую таблицу с правильной структурой
    console.log('🆕 Создаем новую таблицу reviews...');
    const createTableSQL = `
      CREATE TABLE "reviews" (
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
    console.log('✅ Новая таблица reviews создана!');
    
    // Создаем индексы
    const createIndexesSQL = `
      CREATE INDEX "reviews_clinic_id_idx" ON "reviews"("clinic_id");
      CREATE INDEX "reviews_status_idx" ON "reviews"("status");
      CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");
    `;
    
    sqlite.exec(createIndexesSQL);
    console.log('✅ Индексы созданы!');
    
    // Проверяем структуру
    const reviewColumns = sqlite.prepare("PRAGMA table_info(reviews)").all();
    console.log('📋 Структура новой таблицы reviews:');
    reviewColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Ошибка при пересоздании таблицы:', error);
  }
}

recreateReviewsTable();
