import "dotenv/config";
import { db } from "../server/db";
import { cities, districts } from "@shared/schema";
import { eq } from "drizzle-orm";

// Функция для создания slug'а
function createSlug(name: string, isRussian: boolean = false): string {
  let slug = name.toLowerCase();
  
  if (isRussian) {
    // Транслитерация для русских названий
    const translitMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    slug = slug.split('').map(char => translitMap[char] || char).join('');
  } else {
    // Для румынского языка
    slug = slug
      .replace(/ă/g, 'a')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't');
  }
  
  return slug
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function updateCitySlugs() {
  console.log('🔄 Обновляем slug\'ы городов...');
  
  try {
    // Получаем все города
    const allCities = await db.select().from(cities);
    console.log(`📍 Найдено ${allCities.length} городов`);
    
    for (const city of allCities) {
      const slugRu = createSlug(city.nameRu, true);
      const slugRo = createSlug(city.nameRo, false);
      
      await db
        .update(cities)
        .set({ 
          slugRu, 
          slugRo 
        })
        .where(eq(cities.id, city.id));
        
      console.log(`✅ ${city.nameRu} → slugRu: ${slugRu}, slugRo: ${slugRo}`);
    }
    
    console.log('🔄 Обновляем slug\'ы районов...');
    
    // Получаем все районы
    const allDistricts = await db.select().from(districts);
    console.log(`📍 Найдено ${allDistricts.length} районов`);
    
    for (const district of allDistricts) {
      const slugRu = createSlug(district.nameRu, true);
      const slugRo = createSlug(district.nameRo, false);
      
      await db
        .update(districts)
        .set({ 
          slugRu, 
          slugRo 
        })
        .where(eq(districts.id, district.id));
        
      console.log(`✅ ${district.nameRu} → slugRu: ${slugRu}, slugRo: ${slugRo}`);
    }
    
    console.log('🎉 Все slug\'ы обновлены!');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении slug\'ов:', error);
  }
}

updateCitySlugs();
