// Load .env only in development to avoid bundling dotenv in production
if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";
import * as sqliteSchema from "@shared/sqlite-schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL!;

let db: any;
let pool: any;

if (DATABASE_URL) {
  // Используем PostgreSQL (Neon)
  console.log('🗄️ Используем PostgreSQL (Neon)');
  pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Используем SQLite для локальной разработки
  console.log('🗄️ Используем SQLite для локальной разработки');
  const sqlite = new Database('dev.db');
  db = drizzleSQLite(sqlite, { schema: sqliteSchema });
}

export { pool };
export { db };