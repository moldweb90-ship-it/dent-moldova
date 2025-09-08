import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { reviews } from './shared/schema.ts';

const sqlite = new Database('dev.db');
const db = drizzle(sqlite);

try {
  // Создаем таблицу отзывов
  await db.run(`
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
  `);
  
  console.log('✅ Таблица reviews создана успешно!');
  
  // Создаем индексы
  await db.run(`CREATE INDEX IF NOT EXISTS "reviews_clinic_id_idx" ON "reviews"("clinic_id");`);
  await db.run(`CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews"("status");`);
  await db.run(`CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews"("created_at");`);
  
  console.log('✅ Индексы созданы успешно!');
  
} catch (error) {
  console.error('❌ Ошибка при создании таблицы:', error);
} finally {
  sqlite.close();
}
