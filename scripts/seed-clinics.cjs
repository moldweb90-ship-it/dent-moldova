const { Pool } = require('pg');

// Подключение к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/dent_moldova'
});

async function seedClinics() {
  try {
    console.log('🌱 Начинаем добавление клиник...');

    // Сначала добавим город Кишинев
    const cityResult = await pool.query(`
      INSERT INTO cities (id, name_ru, name_ro) 
      VALUES ('f5ca07fa-571e-4eb8-8332-9b90cab89d1c', 'Кишинев', 'Chișinău')
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `);

    const cityId = cityResult.rows[0]?.id || 'f5ca07fa-571e-4eb8-8332-9b90cab89d1c';

    // Добавляем клиники
    const clinics = [
      {
        id: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3',
        slug: 'nobil-dent',
        name: 'Nobil Dent',
        cityId: cityId,
        address: 'ул. Измаил, 98',
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
        id: '682d6e7f-1781-4527-8a33-75f1e15ef9b3',
        slug: 'life-dental',
        name: 'Life Dental',
        cityId: cityId,
        address: 'ул. Дечебал, 45',
        phone: '+373 22 654321',
        website: 'https://lifedental.md',
        languages: ['ru', 'ro', 'en'],
        specializations: ['cosmetic', 'surgery'],
        tags: ['modern', 'comfortable'],
        verified: true,
        cnam: false,
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
        name: 'Prim Dent',
        cityId: cityId,
        address: 'ул. Пушкина, 12',
        phone: '+373 22 789012',
        website: 'https://primdent.md',
        languages: ['ru', 'ro'],
        specializations: ['general', 'pediatrics'],
        tags: ['family', 'trusted'],
        verified: true,
        cnam: true,
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
        name: 'Smile Clinic',
        cityId: cityId,
        address: 'ул. Бэнулеску-Бодони, 67',
        phone: '+373 22 345678',
        website: 'https://smileclinic.md',
        languages: ['ru', 'ro', 'en'],
        specializations: ['cosmetic', 'whitening'],
        tags: ['beauty', 'smile'],
        verified: false,
        cnam: false,
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
        name: 'Dental Center',
        cityId: cityId,
        address: 'ул. Митрополит Варлаам, 23',
        phone: '+373 22 567890',
        website: 'https://dentalcenter.md',
        languages: ['ru', 'ro'],
        specializations: ['implantology', 'surgery', 'orthodontics'],
        tags: ['comprehensive', 'expert'],
        verified: true,
        cnam: true,
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

    for (const clinic of clinics) {
      await pool.query(`
        INSERT INTO clinics (
          id, slug, name, city_id, address, phone, website, 
          languages, specializations, tags, verified, cnam, 
          avail_today, avail_tomorrow, price_index, trust_index, 
          reviews_index, access_index, d_score, recommended, 
          promotional_labels, currency
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
          $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          city_id = EXCLUDED.city_id,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          languages = EXCLUDED.languages,
          specializations = EXCLUDED.specializations,
          tags = EXCLUDED.tags,
          verified = EXCLUDED.verified,
          cnam = EXCLUDED.cnam,
          avail_today = EXCLUDED.avail_today,
          avail_tomorrow = EXCLUDED.avail_tomorrow,
          price_index = EXCLUDED.price_index,
          trust_index = EXCLUDED.trust_index,
          reviews_index = EXCLUDED.reviews_index,
          access_index = EXCLUDED.access_index,
          d_score = EXCLUDED.d_score,
          recommended = EXCLUDED.recommended,
          promotional_labels = EXCLUDED.promotional_labels,
          currency = EXCLUDED.currency,
          updated_at = NOW()
      `, [
        clinic.id, clinic.slug, clinic.name, clinic.cityId, clinic.address, clinic.phone, clinic.website,
        JSON.stringify(clinic.languages), JSON.stringify(clinic.specializations), JSON.stringify(clinic.tags),
        clinic.verified, clinic.cnam, clinic.availToday, clinic.availTomorrow,
        clinic.priceIndex, clinic.trustIndex, clinic.reviewsIndex, clinic.accessIndex, clinic.dScore,
        clinic.recommended, JSON.stringify(clinic.promotionalLabels), clinic.currency
      ]);

      console.log(`✅ Добавлена клиника: ${clinic.name}`);
    }

    // Добавляем услуги для клиник
    const services = [
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', name: 'Консультация', price: 200, currency: 'MDL' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', name: 'Лечение кариеса', price: 800, currency: 'MDL' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', name: 'Имплантация', price: 2500, currency: 'MDL' },
      
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', name: 'Консультация', price: 150, currency: 'MDL' },
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', name: 'Отбеливание', price: 1200, currency: 'MDL' },
      { clinicId: '682d6e7f-1781-4527-8a33-75f1e15ef9b3', name: 'Удаление зуба', price: 600, currency: 'MDL' },
      
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', name: 'Консультация', price: 100, currency: 'MDL' },
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', name: 'Лечение кариеса', price: 600, currency: 'MDL' },
      { clinicId: '3c91daf9-fba8-4b20-ab61-f0f278e0da7a', name: 'Пломбирование', price: 400, currency: 'MDL' }
    ];

    for (const service of services) {
      await pool.query(`
        INSERT INTO services (clinic_id, name, price, currency)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [service.clinicId, service.name, service.price, service.currency]);
    }

    console.log('✅ Услуги добавлены');

    console.log('🎉 Все клиники успешно добавлены!');
  } catch (error) {
    console.error('❌ Ошибка при добавлении клиник:', error);
  } finally {
    await pool.end();
  }
}

seedClinics();
