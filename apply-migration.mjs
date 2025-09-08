import { db } from './server/db.ts';
import fs from 'fs';

async function applyMigration() {
  try {
    const sql = fs.readFileSync('./create-table-simple.sql', 'utf8');
    await db.execute(sql);
    console.log('✅ Migration applied successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

applyMigration();
