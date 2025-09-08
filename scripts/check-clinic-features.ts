import { db } from '../server/db';
import { clinics } from '../shared/schema';

async function checkClinicFeatures() {
  console.log('Проверяем характеристики клиник...\n');
  
  const allClinics = await db.select({
    id: clinics.id,
    name: clinics.name,
    pediatricDentistry: clinics.pediatricDentistry,
    parking: clinics.parking,
    sos: clinics.sos,
    work24h: clinics.work24h,
    credit: clinics.credit,
    weekendWork: clinics.weekendWork,
  }).from(clinics);

  console.log(`Всего клиник: ${allClinics.length}\n`);
  
  allClinics.forEach(clinic => {
    console.log(`Клиника: ${clinic.name}`);
    console.log(`  - Детская стоматология: ${clinic.pediatricDentistry}`);
    console.log(`  - Парковка: ${clinic.parking}`);
    console.log(`  - SOS: ${clinic.sos}`);
    console.log(`  - 24/7: ${clinic.work24h}`);
    console.log(`  - Кредит: ${clinic.credit}`);
    console.log(`  - Выходные: ${clinic.weekendWork}`);
    console.log('');
  });

  // Подсчет клиник с каждой характеристикой
  const stats = {
    pediatricDentistry: allClinics.filter(c => c.pediatricDentistry).length,
    parking: allClinics.filter(c => c.parking).length,
    sos: allClinics.filter(c => c.sos).length,
    work24h: allClinics.filter(c => c.work24h).length,
    credit: allClinics.filter(c => c.credit).length,
    weekendWork: allClinics.filter(c => c.weekendWork).length,
  };

  console.log('Статистика:');
  console.log(`  - Детская стоматология: ${stats.pediatricDentistry} клиник`);
  console.log(`  - Парковка: ${stats.parking} клиник`);
  console.log(`  - SOS: ${stats.sos} клиник`);
  console.log(`  - 24/7: ${stats.work24h} клиник`);
  console.log(`  - Кредит: ${stats.credit} клиник`);
  console.log(`  - Выходные: ${stats.weekendWork} клиник`);
}

checkClinicFeatures().catch(console.error);
