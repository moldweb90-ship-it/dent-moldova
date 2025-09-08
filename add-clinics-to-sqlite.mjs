import Database from 'better-sqlite3';

async function addClinicsToSQLite() {
  try {
    console.log('🔧 Добавляем клиники в SQLite базу данных...');
    
    const sqlite = new Database('dev.db');
    
    // Добавляем города
    sqlite.exec(`
      INSERT OR IGNORE INTO cities (id, name_ru, name_ro) VALUES 
      ('1', 'Кишинёв', 'Chișinău'),
      ('2', 'Бельцы', 'Bălți'),
      ('3', 'Тирасполь', 'Tiraspol');
    `);
    
    // Добавляем районы
    sqlite.exec(`
      INSERT OR IGNORE INTO districts (id, city_id, name_ru, name_ro) VALUES 
      ('1', '1', 'Центр', 'Centru'),
      ('2', '1', 'Ботаника', 'Botanica'),
      ('3', '1', 'Чеканы', 'Ciocana'),
      ('4', '1', 'Рышкановка', 'Râșcani'),
      ('5', '1', 'Буюканы', 'Buiucani');
    `);
    
    // Добавляем клиники
    sqlite.exec(`
      INSERT OR IGNORE INTO clinics (
        id, name_ru, name_ro, city_id, district_id, 
        address_ru, address_ro, phone, email, website, description_ru, description_ro,
        verified, price_index, trust_index, reviews_index, d_score,
        specializations, languages, tags, promotional_labels,
        pediatric_dentistry, parking, sos, work24h, credit, weekend_work,
        urgent_care, convenient_location, installment_plan, has_promotions,
        published_pricing, free_consultation, interest_free_installment,
        implant_warranty, popular_services_promotions, online_price_calculator,
        doctor_experience, has_licenses, access_index
      ) VALUES 
      (
        '1', 'Life Dental Чеканы', 'Life Dental Ciocana',
        '1', '3', 'ул. Дечебал, 123', 'str. Decebal, 123', '+373 22 123456', 'info@lifedental.md',
        'https://lifedental.md', 'Современная стоматологическая клиника', 'Clinica stomatologică modernă',
        1, 75, 85, 90, 83, '["Лечение зубов", "Протезирование", "Имплантация"]', '["ru", "ro"]',
        '["современное оборудование", "опытные врачи"]', '["Бесплатная консультация", "Рассрочка"]',
        1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 15, 1, 85
      ),
      (
        '2', 'Dental Art Центр', 'Dental Art Centru',
        '1', '1', 'ул. Пушкина, 45', 'str. Pușkin, 45', '+373 22 654321', 'info@dentalart.md',
        'https://dentalart.md', 'Клиника эстетической стоматологии', 'Clinica de stomatologie estetică',
        1, 80, 90, 85, 85, '["Эстетическая стоматология", "Отбеливание", "Брекеты"]', '["ru", "ro"]',
        '["эстетика", "красота улыбки"]', '["Скидка 20%", "Бесплатная диагностика"]',
        1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 20, 1, 90
      ),
      (
        '3', 'MedDent Ботаника', 'MedDent Botanica',
        '1', '2', 'ул. Мирча чел Бэтрын, 78', 'str. Mircea cel Bătrân, 78', '+373 22 987654', 'info@meddent.md',
        'https://meddent.md', 'Семейная стоматология', 'Stomatologie familială',
        1, 70, 80, 75, 75, '["Семейная стоматология", "Детская стоматология", "Профилактика"]', '["ru", "ro"]',
        '["семейная клиника", "детская стоматология"]', '["Семейная скидка", "Бесплатный осмотр детей"]',
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 80
      );
    `);
    
    // Добавляем услуги
    sqlite.exec(`
      INSERT OR IGNORE INTO services (id, clinic_id, name, price, price_type, currency, language) VALUES 
      ('1', '1', 'Лечение зубов', 950, 'from', 'MDL', 'ru'),
      ('2', '1', 'Пломбирование', 1200, 'from', 'MDL', 'ru'),
      ('3', '1', 'Имплантация', 3900, 'from', 'MDL', 'ru'),
      ('4', '2', 'Отбеливание', 1500, 'fixed', 'MDL', 'ru'),
      ('5', '2', 'Брекеты', 12000, 'from', 'MDL', 'ru'),
      ('6', '3', 'Детская стоматология', 500, 'from', 'MDL', 'ru'),
      ('7', '3', 'Профилактика', 800, 'fixed', 'MDL', 'ru');
    `);
    
    // Добавляем рабочие часы
    sqlite.exec(`
      INSERT OR IGNORE INTO working_hours (id, clinic_id, day_of_week, open_time, close_time, is_open) VALUES 
      ('1', '1', 1, '09:00', '18:00', 1),
      ('2', '1', 2, '09:00', '18:00', 1),
      ('3', '1', 3, '09:00', '18:00', 1),
      ('4', '1', 4, '09:00', '18:00', 1),
      ('5', '1', 5, '09:00', '18:00', 1),
      ('6', '1', 6, '09:00', '15:00', 1),
      ('7', '1', 0, '10:00', '14:00', 0),
      ('8', '2', 1, '08:00', '20:00', 1),
      ('9', '2', 2, '08:00', '20:00', 1),
      ('10', '2', 3, '08:00', '20:00', 1),
      ('11', '2', 4, '08:00', '20:00', 1),
      ('12', '2', 5, '08:00', '20:00', 1),
      ('13', '2', 6, '08:00', '16:00', 1),
      ('14', '2', 0, '10:00', '16:00', 1),
      ('15', '3', 1, '09:00', '17:00', 1),
      ('16', '3', 2, '09:00', '17:00', 1),
      ('17', '3', 3, '09:00', '17:00', 1),
      ('18', '3', 4, '09:00', '17:00', 1),
      ('19', '3', 5, '09:00', '17:00', 1),
      ('20', '3', 6, '09:00', '14:00', 1),
      ('21', '3', 0, '10:00', '14:00', 0);
    `);
    
    // Добавляем настройки сайта
    sqlite.exec(`
      INSERT OR IGNORE INTO site_settings (id, key, value) VALUES 
      ('1', 'site_title', 'Dent Moldova - Каталог стоматологических клиник'),
      ('2', 'site_description', 'Найдите лучшую стоматологическую клинику в Молдове'),
      ('3', 'contact_email', 'info@dentmoldova.md'),
      ('4', 'contact_phone', '+373 22 123456');
    `);
    
    console.log('✅ Клиники успешно добавлены в SQLite!');
    
    // Проверяем количество клиник
    const clinicCount = sqlite.prepare('SELECT COUNT(*) as count FROM clinics').get();
    console.log(`📊 Всего клиник в базе: ${clinicCount.count}`);
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении клиник:', error);
  }
}

addClinicsToSQLite();
