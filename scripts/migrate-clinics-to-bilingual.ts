import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrateClinicsToBilingual() {
  console.log('🔄 Migrating clinics to bilingual structure...');
  
  try {
    // Сначала добавляем новые колонки
    console.log('📝 Adding new bilingual columns...');
    
    await db.execute(sql`
      ALTER TABLE clinics 
      ADD COLUMN IF NOT EXISTS name_ru TEXT,
      ADD COLUMN IF NOT EXISTS name_ro TEXT,
      ADD COLUMN IF NOT EXISTS address_ru TEXT,
      ADD COLUMN IF NOT EXISTS address_ro TEXT,
      ADD COLUMN IF NOT EXISTS seo_title_ru TEXT,
      ADD COLUMN IF NOT EXISTS seo_title_ro TEXT,
      ADD COLUMN IF NOT EXISTS seo_description_ru TEXT,
      ADD COLUMN IF NOT EXISTS seo_description_ro TEXT,
      ADD COLUMN IF NOT EXISTS seo_keywords_ru TEXT,
      ADD COLUMN IF NOT EXISTS seo_keywords_ro TEXT,
      ADD COLUMN IF NOT EXISTS seo_h1_ru TEXT,
      ADD COLUMN IF NOT EXISTS seo_h1_ro TEXT,
      ADD COLUMN IF NOT EXISTS og_title_ru TEXT,
      ADD COLUMN IF NOT EXISTS og_title_ro TEXT,
      ADD COLUMN IF NOT EXISTS og_description_ru TEXT,
      ADD COLUMN IF NOT EXISTS og_description_ro TEXT
    `);
    
    console.log('✅ New columns added');
    
    // Копируем данные из старых полей в новые
    console.log('📋 Copying data to new bilingual fields...');
    
    await db.execute(sql`
      UPDATE clinics 
      SET 
        name_ru = name,
        name_ro = name,
        address_ru = address,
        address_ro = address,
        seo_title_ru = seo_title,
        seo_title_ro = seo_title,
        seo_description_ru = seo_description,
        seo_description_ro = seo_description,
        seo_keywords_ru = seo_keywords,
        seo_keywords_ro = seo_keywords,
        seo_h1_ru = seo_h1,
        seo_h1_ro = seo_h1,
        og_title_ru = og_title,
        og_title_ro = og_title,
        og_description_ru = og_description,
        og_description_ro = og_description
      WHERE name_ru IS NULL
    `);
    
    console.log('✅ Data copied successfully!');
    console.log('⚠️  Note: Romanian fields are currently copied from Russian. Please update them manually in the admin panel.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateClinicsToBilingual().catch(console.error);
