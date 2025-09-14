// Простой скрипт для обновления slug
const { neon } = require('@neondatabase/serverless');

// Загружаем переменные окружения
require('dotenv').config();

function transliterate(str) {
  const translit = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  
  return str.toLowerCase()
    .replace(/[а-я]/g, (match) => translit[match] || match)
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
}

async function updateSlugs() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('Обновляем slug для городов...');
    
    // Обновляем города
    const cities = await sql`SELECT id, name_ru FROM cities`;
    for (const city of cities) {
      const slug = transliterate(city.name_ru);
      await sql`UPDATE cities SET slug = ${slug} WHERE id = ${city.id}`;
      console.log(`${city.name_ru} -> ${slug}`);
    }
    
    // Обновляем районы
    const districts = await sql`SELECT id, name_ru FROM districts`;
    for (const district of districts) {
      const slug = transliterate(district.name_ru);
      await sql`UPDATE districts SET slug = ${slug} WHERE id = ${district.id}`;
      console.log(`Район ${district.name_ru} -> ${slug}`);
    }
    
    console.log('✅ Slug обновлены!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

updateSlugs();
