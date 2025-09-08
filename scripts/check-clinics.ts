import { db } from '../server/db';
import { clinics } from '../shared/schema';

async function checkClinics() {
  try {
    console.log('🔍 Проверяем клиники в базе данных...');
    
    const allClinics = await db.select().from(clinics);
    
    console.log(`Найдено клиник: ${allClinics.length}`);
    
    for (const clinic of allClinics) {
      console.log(`ID: ${clinic.id}, Название RU: ${clinic.nameRu}, Название RO: ${clinic.nameRo}, Slug: ${clinic.slug}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке клиник:', error);
  } finally {
    process.exit(0);
  }
}

checkClinics();
