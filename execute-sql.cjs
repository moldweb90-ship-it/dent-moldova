const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function executeSQL() {
  try {
    // Загружаем переменные окружения
    require('dotenv').config();
    
    const sql = neon(process.env.DATABASE_URL);
    const sqlContent = fs.readFileSync('update-slugs.sql', 'utf8');
    
    console.log('Выполняем SQL для обновления slug...');
    await sql(sqlContent);
    console.log('✅ SQL выполнен успешно!');
    
    // Проверяем результат
    const cities = await sql`SELECT name_ru, slug FROM cities ORDER BY name_ru`;
    console.log('\nГорода с slug:');
    cities.forEach(city => {
      console.log(`  ${city.name_ru} -> ${city.slug}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

executeSQL();
