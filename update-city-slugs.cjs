const { neon } = require('@neondatabase/serverless');

async function updateCitySlugs() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('Обновляем slug для городов...');
    
    // Получаем все города без slug
    const cities = await sql`SELECT id, name_ru, name_ro FROM cities WHERE slug IS NULL OR slug = ''`;
    console.log('Найдено городов без slug:', cities.length);
    
    for (const city of cities) {
      // Создаем slug из названия на русском
      const slug = city.name_ru
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s]/g, '') // Убираем спецсимволы
        .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
        .replace(/[а-я]/g, (match) => {
          // Простая транслитерация для кириллицы
          const translit = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return translit[match] || match;
        });
      
      console.log(`Обновляем ${city.name_ru} -> slug: ${slug}`);
      
      await sql`UPDATE cities SET slug = ${slug} WHERE id = ${city.id}`;
    }
    
    // Обновляем slug для районов
    const districts = await sql`SELECT id, name_ru, name_ro FROM districts WHERE slug IS NULL OR slug = ''`;
    console.log('Найдено районов без slug:', districts.length);
    
    for (const district of districts) {
      const slug = district.name_ru
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[а-я]/g, (match) => {
          const translit = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return translit[match] || match;
        });
      
      console.log(`Обновляем район ${district.name_ru} -> slug: ${slug}`);
      
      await sql`UPDATE districts SET slug = ${slug} WHERE id = ${district.id}`;
    }
    
    console.log('✅ Slug для всех городов и районов обновлены!');
    
    // Показываем результат
    const updatedCities = await sql`SELECT name_ru, slug FROM cities ORDER BY name_ru`;
    console.log('\nГорода с slug:');
    updatedCities.forEach(city => {
      console.log(`  ${city.name_ru} -> ${city.slug}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении slug:', error.message);
  }
}

updateCitySlugs();
