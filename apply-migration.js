const { db } = require('./server/db');
const fs = require('fs');

async function applyMigration() {
  try {
    const sql = fs.readFileSync('./migrations/0017_add_new_clinic_requests.sql', 'utf8');
    await db.execute(sql);
    console.log('✅ Migration applied successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

applyMigration();
