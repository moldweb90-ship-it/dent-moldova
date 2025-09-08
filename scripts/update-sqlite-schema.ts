import Database from 'better-sqlite3';

const sqlite = new Database('dev.db');

function updateSQLiteSchema() {
  try {
    console.log('🔧 Обновляем SQLite схему...\n');
    
    // Добавляем двуязычные поля в таблицу clinics
    console.log('📝 Добавляем двуязычные поля в таблицу clinics...');
    
    const alterQueries = [
      // Переименовываем существующие поля в русские версии
      "ALTER TABLE clinics RENAME COLUMN name TO name_ru",
      "ALTER TABLE clinics RENAME COLUMN address TO address_ru",
      
      // Добавляем румынские версии полей
      "ALTER TABLE clinics ADD COLUMN name_ro TEXT",
      "ALTER TABLE clinics ADD COLUMN address_ro TEXT",
      
      // Добавляем SEO поля
      "ALTER TABLE clinics ADD COLUMN seo_title_ru TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_title_ro TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_description_ru TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_description_ro TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_keywords_ru TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_keywords_ro TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_h1_ru TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_h1_ro TEXT",
      "ALTER TABLE clinics ADD COLUMN og_title_ru TEXT",
      "ALTER TABLE clinics ADD COLUMN og_title_ro TEXT",
      "ALTER TABLE clinics ADD COLUMN og_description_ru TEXT",
      "ALTER TABLE clinics ADD COLUMN og_description_ro TEXT",
      "ALTER TABLE clinics ADD COLUMN og_image TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_canonical TEXT",
      "ALTER TABLE clinics ADD COLUMN seo_robots TEXT DEFAULT 'index,follow'",
      "ALTER TABLE clinics ADD COLUMN seo_priority REAL DEFAULT 0.5",
      "ALTER TABLE clinics ADD COLUMN seo_schema_type TEXT DEFAULT 'Dentist'",
      "ALTER TABLE clinics ADD COLUMN seo_schema_data TEXT",
      
      // Добавляем недостающие поля
      "ALTER TABLE clinics ADD COLUMN currency TEXT DEFAULT 'MDL'",
      "ALTER TABLE clinics ADD COLUMN doctor_experience INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN has_licenses INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN has_certificates INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN online_booking INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN weekend_work INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN evening_work INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN urgent_care INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN convenient_location INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN installment_plan INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN has_promotions INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN published_pricing INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN free_consultation INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN interest_free_installment INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN implant_warranty INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN popular_services_promotions INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN online_price_calculator INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN pediatric_dentistry INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN parking INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN sos INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN work_24h INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN credit INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN recommended INTEGER DEFAULT 0",
      "ALTER TABLE clinics ADD COLUMN promotional_labels TEXT",
      "ALTER TABLE clinics ADD COLUMN google_rating REAL",
      "ALTER TABLE clinics ADD COLUMN google_reviews_count INTEGER"
    ];
    
    // Выполняем миграции
    sqlite.exec('BEGIN TRANSACTION');
    
    for (const query of alterQueries) {
      try {
        console.log(`  Выполняем: ${query}`);
        sqlite.exec(query);
      } catch (error: any) {
        if (error.code === 'SQLITE_ERROR' && error.message.includes('duplicate column name')) {
          console.log(`  ⚠️ Колонка уже существует: ${query}`);
        } else {
          console.log(`  ❌ Ошибка: ${error.message}`);
        }
      }
    }
    
    // Обновляем данные для существующих клиник
    console.log('\n📊 Обновляем данные существующих клиник...');
    
    // Копируем русские данные в румынские поля (временно)
    sqlite.exec(`
      UPDATE clinics 
      SET name_ro = name_ru, 
          address_ro = address_ru
      WHERE name_ro IS NULL
    `);
    
    sqlite.exec('COMMIT');
    
    console.log('✅ Схема успешно обновлена!');
    
    // Проверяем результат
    console.log('\n📋 Новая структура таблицы clinics:');
    const columns = sqlite.prepare("PRAGMA table_info(clinics)").all();
    columns.forEach((column: any) => {
      console.log(`  - ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : ''} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
    });

  } catch (error) {
    console.error('❌ Ошибка при обновлении схемы:', error);
    sqlite.exec('ROLLBACK');
  } finally {
    sqlite.close();
  }
}

updateSQLiteSchema();
