const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function applyMigration() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const migrationSQL = fs.readFileSync('migrations/add_seo_fields_to_cities_districts.sql', 'utf8');
    
    console.log('Применяем миграцию SEO полей...');
    await sql(migrationSQL);
    console.log('✅ Миграция успешно применена!');
    
    // Проверим, что поля добавились
    const citiesColumns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'cities' AND column_name LIKE '%slug%'`;
    console.log('Поля slug в cities:', citiesColumns);
    
  } catch (error) {
    console.error('❌ Ошибка при применении миграции:', error.message);
  }
}

applyMigration();
