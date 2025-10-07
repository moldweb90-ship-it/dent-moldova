const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq, sql } = require('drizzle-orm');
const { pgTable, text, varchar, integer, timestamp } = require('drizzle-orm/pg-core');

// Define cities table schema
const cities = pgTable("cities", {
  id: varchar("id").primaryKey(),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  slugRu: varchar("slug_ru", { length: 255 }),
  slugRo: varchar("slug_ro", { length: 255 }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transliteration functions
function transliterateRu(text) {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };
  
  return text.split('').map(char => map[char] || char).join('');
}

function transliterateRo(text) {
  const map = {
    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
    'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
  };
  
  return text.split('').map(char => map[char] || char).join('');
}

function createSlug(text, language) {
  const transliterated = language === 'ru' ? transliterateRu(text) : transliterateRo(text);
  
  return transliterated
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fixCitySlugs() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment');
    process.exit(1);
  }

  const sql = postgres(connectionString);
  const db = drizzle(sql);

  try {
    console.log('🔍 Fetching all cities...');
    const allCities = await db.select().from(cities);
    
    console.log(`📊 Found ${allCities.length} cities`);
    
    for (const city of allCities) {
      const updates = {};
      
      if (!city.slugRu && city.nameRu) {
        updates.slugRu = createSlug(city.nameRu, 'ru');
        console.log(`  ✏️  ${city.nameRu} -> slugRu: ${updates.slugRu}`);
      }
      
      if (!city.slugRo && city.nameRo) {
        updates.slugRo = createSlug(city.nameRo, 'ro');
        console.log(`  ✏️  ${city.nameRo} -> slugRo: ${updates.slugRo}`);
      }
      
      if (Object.keys(updates).length > 0) {
        await db.update(cities)
          .set(updates)
          .where(eq(cities.id, city.id));
        console.log(`  ✅ Updated: ${city.nameRu} / ${city.nameRo}`);
      } else {
        console.log(`  ⏭️  Skipped: ${city.nameRu} (already has slugs)`);
      }
    }
    
    console.log('\n✅ All cities updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

fixCitySlugs();

