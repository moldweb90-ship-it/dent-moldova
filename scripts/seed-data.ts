import { db } from '../server/db';
import { cities, clinics, services, workingHours } from '../shared/schema';

async function seedData() {
  try {
    console.log('🌱 Начинаем добавление данных...');

    // Добавляем город Кишинев
    const cityData = {
      id: 'f5ca07fa-571e-4eb8-8332-9b90cab89d1c',
      nameRu: 'Кишинев',
      nameRo: 'Chișinău'
    };

    await db.insert(cities).values(cityData).onConflictDoNothing();
    console.log('✅ Город добавлен');

    // Данные клиник
    const clinicsData = [
      {
        id: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3',
        slug: 'nobil-dent',
        nameRu: 'Nobil Dent',
        nameRo: 'Nobil Dent',
        cityId: cityData.id,
        addressRu: 'ул. Измаил, 98',
        addressRo: 'str. Ismail, 98',
        phone: '+373 22 123456',
        website: 'https://nobildent.md',
        languages: ['ru', 'ro'],
        specializations: ['implantology', 'orthodontics'],
        tags: ['premium', 'modern'],
        verified: true,
        availToday: true,
        priceIndex: 75,
        trustIndex: 85,
        reviewsIndex: 90,
        accessIndex: 80,
        dScore: 82,
        recommended: true,
        promotionalLabels: ['top', 'premium'],
        currency: 'MDL'
      },
      {
        id: '682d6e7f-1781-4527-8a33-75f1e15ef9b3',
        slug: 'life-dental',
        nameRu: 'Life Dental',
        nameRo: 'Life Dental',
        cityId: cityData.id,
        addressRu: 'ул. Дечебал, 45',
        addressRo: 'str. Decebal, 45',
        phone: '+373 22 654321',
        website: 'https://lifedental.md',
        languages: ['ru', 'ro', 'en'],
        specializations: ['cosmetic', 'surgery'],
        tags: ['modern', 'comfortable'],
        verified: true,
        availToday: false,
        availTomorrow: true,
        priceIndex: 65,
        trustIndex: 80,
        reviewsIndex: 85,
        accessIndex: 75,
        dScore: 78,
        recommended: false,
        promotionalLabels: ['high_rating'],
        currency: 'MDL'
      },
      {
        id: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a',
        slug: 'primdent',
        nameRu: 'Prim Dent',
        nameRo: 'Prim Dent',
        cityId: cityData.id,
        addressRu: 'ул. Пушкина, 12',
        addressRo: 'str. Pușkin, 12',
        phone: '+373 22 789012',
        website: 'https://primdent.md',
        languages: ['ru', 'ro'],
        specializations: ['general', 'pediatrics'],
        tags: ['family', 'trusted'],
        verified: true,
        availToday: true,
        availTomorrow: true,
        priceIndex: 55,
        trustIndex: 90,
        reviewsIndex: 88,
        accessIndex: 85,
        dScore: 80,
        recommended: true,
        promotionalLabels: ['verified_plus'],
        currency: 'MDL'
      },
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        slug: 'smile-clinic',
        nameRu: 'Smile Clinic',
        nameRo: 'Smile Clinic',
        cityId: cityData.id,
        addressRu: 'ул. Бэнулеску-Бодони, 67',
        addressRo: 'str. Bănulescu-Bodoni, 67',
        phone: '+373 22 345678',
        website: 'https://smileclinic.md',
        languages: ['ru', 'ro', 'en'],
        specializations: ['cosmetic', 'whitening'],
        tags: ['beauty', 'smile'],
        verified: false,
        availToday: false,
        availTomorrow: false,
        priceIndex: 70,
        trustIndex: 75,
        reviewsIndex: 82,
        accessIndex: 70,
        dScore: 74,
        recommended: false,
        promotionalLabels: ['new'],
        currency: 'MDL'
      },
             {
         id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
         slug: 'dental-center',
         nameRu: 'Dental Center',
         nameRo: 'Dental Center',
         cityId: cityData.id,
         addressRu: 'ул. Митрополит Варлаам, 23',
         addressRo: 'str. Mitropolit Varlaam, 23',
        phone: '+373 22 567890',
        website: 'https://dentalcenter.md',
        languages: ['ru', 'ro'],
        specializations: ['implantology', 'surgery', 'orthodontics'],
        tags: ['comprehensive', 'expert'],
        verified: true,
        availToday: true,
        availTomorrow: true,
        priceIndex: 80,
        trustIndex: 95,
        reviewsIndex: 92,
        accessIndex: 90,
        dScore: 89,
        recommended: true,
        promotionalLabels: ['top', 'premium', 'high_rating'],
        currency: 'MDL'
      }
    ];

         // Добавляем клиники
     for (const clinic of clinicsData) {
       await db.insert(clinics).values(clinic).onConflictDoNothing();
       console.log(`✅ Добавлена клиника: ${clinic.nameRu || clinic.nameRo}`);
     }

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
    }

    console.log('✅ Услуги добавлены');

    // Добавляем время работы для клиник
    const workingHoursData = [
      // Nobil Dent - работает с 9:00 до 18:00, кроме воскресенья
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Понедельник
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Вторник
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Среда
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Четверг
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Пятница
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '16:00' }, // Суббота
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', dayOfWeek: 0, isOpen: false }, // Воскресенье

      // Life Dental - работает 24/7
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', dayOfWeek: 0, isOpen: true, is24Hours: true }, // Воскресенье
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', dayOfWeek: 1, isOpen: true, is24Hours: true }, // Понедельник
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', dayOfWeek: 2, isOpen: true, is24Hours: true }, // Вторник
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', dayOfWeek: 3, isOpen: true, is24Hours: true }, // Среда
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', dayOfWeek: 4, isOpen: true, is24Hours: true }, // Четверг
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', dayOfWeek: 5, isOpen: true, is24Hours: true }, // Пятница
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', dayOfWeek: 6, isOpen: true, is24Hours: true }, // Суббота

      // Prim Dent - работает с 8:00 до 20:00, кроме субботы и воскресенья
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '20:00' }, // Понедельник
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '20:00' }, // Вторник
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '20:00' }, // Среда
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '20:00' }, // Четверг
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '20:00' }, // Пятница
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', dayOfWeek: 6, isOpen: false }, // Суббота
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', dayOfWeek: 0, isOpen: false }, // Воскресенье

      // Smile Clinic - работает с 10:00 до 19:00, кроме воскресенья
      { clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '19:00' }, // Понедельник
      { clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '19:00' }, // Вторник
      { clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '19:00' }, // Среда
      { clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '19:00' }, // Четверг
      { clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '19:00' }, // Пятница
      { clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '17:00' }, // Суббота
      { clinicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', dayOfWeek: 0, isOpen: false }, // Воскресенье

      // Dental Center - работает с 8:30 до 19:00, кроме воскресенья
      { clinicId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', dayOfWeek: 1, isOpen: true, openTime: '08:30', closeTime: '19:00' }, // Понедельник
      { clinicId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', dayOfWeek: 2, isOpen: true, openTime: '08:30', closeTime: '19:00' }, // Вторник
      { clinicId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', dayOfWeek: 3, isOpen: true, openTime: '08:30', closeTime: '19:00' }, // Среда
      { clinicId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', dayOfWeek: 4, isOpen: true, openTime: '08:30', closeTime: '19:00' }, // Четверг
      { clinicId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', dayOfWeek: 5, isOpen: true, openTime: '08:30', closeTime: '19:00' }, // Пятница
      { clinicId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', dayOfWeek: 6, isOpen: true, openTime: '08:30', closeTime: '17:00' }, // Суббота
      { clinicId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', dayOfWeek: 0, isOpen: false }, // Воскресенье
    ];

    for (const wh of workingHoursData) {
      await db.insert(workingHours).values(wh).onConflictDoNothing();
    }

    console.log('✅ Время работы добавлено');
    console.log('🎉 Все данные успешно добавлены!');

  } catch (error) {
    console.error('❌ Ошибка при добавлении данных:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
