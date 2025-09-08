import { db } from '../server/db';
import { clinics } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function updateClinicFeatures() {
  console.log('Обновляем характеристики клиник...');
  
  try {
    // Обновляем Life Dental - добавляем несколько характеристик
    await db.update(clinics)
      .set({
        pediatricDentistry: true,
        parking: true,
        sos: true,
        work24h: false,
        credit: true,
        weekendWork: true,
      })
      .where(eq(clinics.name, 'Life Dental'));
    
    // Обновляем Dental Center - добавляем другие характеристики
    await db.update(clinics)
      .set({
        pediatricDentistry: false,
        parking: true,
        sos: false,
        work24h: true,
        credit: false,
        weekendWork: true,
      })
      .where(eq(clinics.name, 'Dental Center'));
    
    console.log('✅ Характеристики обновлены!');
    
    // Проверяем результат
    const updatedClinics = await db.select({
      name: clinics.name,
      pediatricDentistry: clinics.pediatricDentistry,
      parking: clinics.parking,
      sos: clinics.sos,
      work24h: clinics.work24h,
      credit: clinics.credit,
      weekendWork: clinics.weekendWork,
    })
    .from(clinics)
    .where(eq(clinics.name, 'Life Dental'));
    
    if (updatedClinics.length > 0) {
      const clinic = updatedClinics[0];
      console.log('\nОбновленная клиника:', clinic.name);
      console.log(`  - Детская стоматология: ${clinic.pediatricDentistry}`);
      console.log(`  - Парковка: ${clinic.parking}`);
      console.log(`  - SOS: ${clinic.sos}`);
      console.log(`  - 24/7: ${clinic.work24h}`);
      console.log(`  - Кредит: ${clinic.credit}`);
      console.log(`  - Выходные: ${clinic.weekendWork}`);
    }
    
  } catch (error) {
    console.error('Ошибка при обновлении:', error);
  }
}

updateClinicFeatures().catch(console.error);
