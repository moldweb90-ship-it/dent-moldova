import { db } from '../server/db';
import { cities, clinics, services } from '../shared/sqlite-schema';
import { nanoid } from 'nanoid';

async function initSQLite() {
  try {
    console.log('🗄️ Инициализация SQLite базы данных...');

    // Создаем таблицы
    console.log('📊 Создание таблиц...');
    
    // Добавляем город Кишинев
    const cityId = nanoid();
    const cityData = {
      id: cityId,
      nameRu: 'Кишинев',
      nameRo: 'Chișinău'
    };

    await db.insert(cities).values(cityData);
    console.log('✅ Город добавлен');

    // Данные клиник
    const clinicsData = [
      {
        id: nanoid(),
        slug: 'nobil-dent',
        nameRu: 'Nobil Dent',
        nameRo: 'Nobil Dent',
        cityId: cityId,
        addressRu: 'ул. Измаил, 98',
        addressRo: 'str. Ismail, 98',
        phone: '+373 22 123456',
        website: 'https://nobildent.md',
        languages: ['ru', 'ro'],
        specializations: ['implantology', 'orthodontics'],
        tags: ['premium', 'modern'],
        verified: true,
        cnam: true,
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
        id: nanoid(),
        slug: 'life-dental',
        nameRu: 'Life Dental',
        nameRo: 'Life Dental',
        cityId: cityId,
        addressRu: 'бул. Штефан чел Маре, 126',
        addressRo: 'bd. Ștefan cel Mare, 126',
        phone: '+373 22 789012',
        website: 'https://lifedental.md',
        languages: ['ru', 'ro', 'en'],
        specializations: ['prosthetics', 'surgery'],
        tags: ['modern', 'quality'],
        verified: true,
        cnam: false,
        availToday: false,
        priceIndex: 60,
        trustIndex: 80,
        reviewsIndex: 85,
        accessIndex: 85,
        dScore: 78,
        recommended: true,
        promotionalLabels: ['quality'],
        currency: 'MDL'
      },
      {
        id: nanoid(),
        slug: 'denta-vita',
        nameRu: 'Denta Vita',
        nameRo: 'Denta Vita',
        cityId: cityId,
        addressRu: 'ул. Пушкина, 45',
        addressRo: 'str. Pușkin, 45',
        phone: '+373 22 345678',
        website: 'https://dentavita.md',
        languages: ['ru', 'ro'],
        specializations: ['pediatric', 'therapy'],
        tags: ['family', 'affordable'],
        verified: false,
        cnam: true,
        availToday: true,
        priceIndex: 45,
        trustIndex: 70,
        reviewsIndex: 75,
        accessIndex: 90,
        dScore: 70,
        recommended: false,
        promotionalLabels: ['affordable'],
        currency: 'MDL'
      }
    ];

    await db.insert(clinics).values(clinicsData);
    console.log('✅ Клиники добавлены');

    // Добавляем услуги
    const servicesData = [
      {
        id: nanoid(),
        clinicId: clinicsData[0].id,
        nameRu: 'Консультация стоматолога',
        nameRo: 'Consultație stomatolog',
        price: 250,
        currency: 'MDL',
        language: 'ru'
      },
      {
        id: nanoid(),
        clinicId: clinicsData[0].id,
        nameRu: 'Имплант зуба',
        nameRo: 'Implant dentar',
        price: 8500,
        currency: 'MDL',
        language: 'ru'
      },
      {
        id: nanoid(),
        clinicId: clinicsData[1].id,
        nameRu: 'Чистка зубов',
        nameRo: 'Curățare dentară',
        price: 400,
        currency: 'MDL',
        language: 'ru'
      }
    ];

    await db.insert(services).values(servicesData);
    console.log('✅ Услуги добавлены');

    console.log('🎉 База данных успешно инициализирована!');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
  }
}

initSQLite();
