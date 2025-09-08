import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

console.log('🔍 Connecting to PostgreSQL...');

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

try {
  console.log('📋 Reading migration file...');
  const sql = fs.readFileSync('./migrations/0022_add_reviews_table_postgres.sql', 'utf8');
  
  console.log('🚀 Applying migration...');
  await db.execute(sql);
  
  console.log('✅ Migration applied successfully!');
  
  // Проверяем, что таблица создалась
  const result = await db.execute('SELECT COUNT(*) as count FROM reviews');
  console.log(`📊 Reviews table created, current count: ${result.rows[0].count}`);
  
} catch (error) {
  console.error('❌ Migration failed:', error);
} finally {
  await pool.end();
  process.exit(0);
}
