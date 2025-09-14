// Простой скрипт для обновления slug через API
async function updateSlugs() {
  try {
    // Получаем список городов
    const citiesResponse = await fetch('http://localhost:5000/api/cities');
    const cities = await citiesResponse.json();
    
    console.log('Найдено городов:', cities.length);
    
    for (const city of cities) {
      if (!city.slug) {
        // Создаем slug из названия
        const slug = city.nameRu
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
        
        console.log(`Обновляем ${city.nameRu} -> slug: ${slug}`);
        
        // Обновляем через API
        const updateResponse = await fetch(`http://localhost:5000/api/admin/cities/${city.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...city,
            slug: slug
          })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ ${city.nameRu} обновлен`);
        } else {
          console.error(`❌ Ошибка обновления ${city.nameRu}`);
        }
      }
    }
    
    console.log('✅ Все slug обновлены!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

updateSlugs();
