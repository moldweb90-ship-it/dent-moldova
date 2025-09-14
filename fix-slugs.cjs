const { neon } = require('@neondatabase/serverless');

// Простая транслитерация
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

async function fixSlugs() {
  try {
    // Используем переменную окружения из процесса
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL не найден в переменных окружения');
      return;
    }
    
    const sql = neon(databaseUrl);
    
    console.log('Обновляем slug для городов...');
    
    // Получаем все города
    const cities = await sql`SELECT id, name_ru FROM cities`;
    console.log('Найдено городов:', cities.length);
    
    for (const city of cities) {
      const slug = transliterate(city.name_ru);
      console.log(`${city.name_ru} -> ${slug}`);
      await sql`UPDATE cities SET slug = ${slug} WHERE id = ${city.id}`;
    }
    
    // Обновляем slug для районов
    const districts = await sql`SELECT id, name_ru FROM districts`;
    console.log('Найдено районов:', districts.length);
    
    for (const district of districts) {
      const slug = transliterate(district.name_ru);
      console.log(`Район ${district.name_ru} -> ${slug}`);
      await sql`UPDATE districts SET slug = ${slug} WHERE id = ${district.id}`;
    }
    
    console.log('✅ Slug обновлены!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

fixSlugs();
