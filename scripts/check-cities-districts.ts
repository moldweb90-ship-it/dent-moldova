import { db } from '../server/db';
import { cities, districts } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function checkCitiesAndDistricts() {
  console.log('🔍 Checking cities and districts in database...\n');

  try {
    // Get all cities
    const citiesList = await db.select().from(cities);
    console.log(`📊 Found ${citiesList.length} cities:`);
    citiesList.forEach(city => {
      console.log(`  - ${city.nameRu} / ${city.nameRo} (ID: ${city.id})`);
    });

    console.log('\n📊 Districts by city:');
    
    // Get districts for each city
    for (const city of citiesList) {
      const cityDistricts = await db.select().from(districts).where(eq(districts.cityId, city.id));
      console.log(`\n  🏙️ ${city.nameRu}:`);
      if (cityDistricts.length === 0) {
        console.log('    ❌ No districts found');
      } else {
        cityDistricts.forEach(district => {
          console.log(`    ✅ ${district.nameRu} / ${district.nameRo} (ID: ${district.id})`);
        });
      }
    }

    // Get all districts
    const allDistricts = await db.select().from(districts);
    console.log(`\n📊 Total districts: ${allDistricts.length}`);
    
    // Check for orphaned districts
    const orphanedDistricts = allDistricts.filter(d => !citiesList.find(c => c.id === d.cityId));
    if (orphanedDistricts.length > 0) {
      console.log('\n⚠️ Orphaned districts (no city):');
      orphanedDistricts.forEach(district => {
        console.log(`  - ${district.nameRu} / ${district.nameRo} (ID: ${district.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking cities and districts:', error);
  }

  process.exit(0);
}

checkCitiesAndDistricts();

