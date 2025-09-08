import { db } from '../server/db';

async function addClinicFeatures() {
  console.log('Добавляем колонки характеристик клиник...');
  
  try {
    // Добавляем колонки если их нет
    await db.execute(`
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS pediatric_dentistry BOOLEAN DEFAULT FALSE;
    `);
    
    await db.execute(`
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS parking BOOLEAN DEFAULT FALSE;
    `);
    
    await db.execute(`
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS sos BOOLEAN DEFAULT FALSE;
    `);
    
    await db.execute(`
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS work_24h BOOLEAN DEFAULT FALSE;
    `);
    
    await db.execute(`
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS credit BOOLEAN DEFAULT FALSE;
    `);
    
    console.log('✅ Колонки успешно добавлены!');
    
    // Проверяем что колонки добавились
    const result = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clinics' 
      AND column_name IN ('pediatric_dentistry', 'parking', 'sos', 'work_24h', 'credit')
    `);
    
    console.log('Добавленные колонки:', result.rows.map((row: any) => row.column_name));
    
  } catch (error) {
    console.error('Ошибка при добавлении колонок:', error);
  }
}

addClinicFeatures().catch(console.error);
