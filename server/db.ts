// Всегда загружаем .env файл
import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";

// Настройка WebSocket для Neon только если ws доступен
try {
  if (typeof ws !== 'undefined') {
    neonConfig.webSocketConstructor = ws;
  }
} catch (error) {
  console.warn('⚠️ WebSocket не доступен, используем HTTP подключение к БД');
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('❌ DATABASE_URL не найден в переменных окружения! Проверьте .env файл.');
}

console.log(`🗄️ Используем PostgreSQL (Neon)`);
console.log(`📍 Database host: ${new URL(DATABASE_URL).hostname}`);

const pool = new Pool({ 
  connectionString: DATABASE_URL,
  // Настройки для предотвращения отключения соединений
  max: 10,                    // Максимум соединений в пуле (меньше для стабильности)
  min: 2,                     // Минимум соединений в пуле
  idleTimeoutMillis: 60000,   // 60 секунд до закрытия неактивного соединения
  connectionTimeoutMillis: 15000, // 15 секунд на установку соединения
  keepAlive: true,            // Поддерживать соединения живыми
  keepAliveInitialDelayMillis: 10000, // Задержка перед первым keepalive
  statement_timeout: 30000,   // 30 секунд таймаут на запрос
  query_timeout: 30000        // 30 секунд таймаут на запрос
});

// Обработка ошибок пула соединений
pool.on('error', (err) => {
  console.error('❌ Ошибка пула БД:', err);
  // Не завершаем процесс, пул сам переподключится
});

pool.on('connect', () => {
  console.log('✅ Новое соединение с БД установлено');
});

pool.on('remove', () => {
  console.log('ℹ️ Соединение с БД закрыто');
});

const db = drizzle({ client: pool, schema });

// Функция для проверки соединения с БД
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Используем drizzle для проверки соединения
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка проверки соединения с БД:', error);
    return false;
  }
}

export { pool, db };