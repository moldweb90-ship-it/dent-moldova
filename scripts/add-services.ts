import { db } from '../server/db';
import { services } from '../shared/schema';

async function addServices() {
  try {
    console.log('🌱 Добавляем услуги...');

    // Добавляем услуги
    const servicesData = [
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', name: 'Консультация', price: 200, currency: 'MDL' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', name: 'Лечение кариеса', price: 800, currency: 'MDL' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', name: 'Имплантация', price: 2500, currency: 'MDL' },
      
      { clinicId: '50700388-9022-46bf-ace0-8e2335b744bb', name: 'Консультация', price: 150, currency: 'MDL' },
      { clinicId: '50700388-9022-46bf-ace0-8e2335b744bb', name: 'Отбеливание', price: 1200, currency: 'MDL' },
      { clinicId: '50700388-9022-46bf-ace0-8e2335b744bb', name: 'Удаление зуба', price: 600, currency: 'MDL' },
      
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', name: 'Консультация', price: 100, currency: 'MDL' },
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', name: 'Лечение кариеса', price: 600, currency: 'MDL' },
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', name: 'Пломбирование', price: 400, currency: 'MDL' }
    ];

    for (const service of servicesData) {
      await db.insert(services).values(service).onConflictDoNothing();
      console.log(`✅ Добавлена услуга: ${service.name} для клиники ${service.clinicId}`);
    }

    console.log('🎉 Все услуги успешно добавлены!');

  } catch (error) {
    console.error('❌ Ошибка при добавлении услуг:', error);
  } finally {
    process.exit(0);
  }
}

addServices();
