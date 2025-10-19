// Всегда загружаем .env файл
import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
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

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool, schema });

export { pool, db };