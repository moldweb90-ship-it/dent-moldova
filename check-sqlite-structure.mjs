import Database from 'better-sqlite3';

async function checkSQLiteStructure() {
  try {
    console.log('🔍 Проверяем структуру SQLite базы данных...');
    
    const sqlite = new Database('dev.db');
    
    // Проверяем структуру таблицы clinics
    const clinicColumns = sqlite.prepare("PRAGMA table_info(clinics)").all();
    console.log('📋 Структура таблицы clinics:');
    clinicColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    // Проверяем количество клиник
    const clinicCount = sqlite.prepare('SELECT COUNT(*) as count FROM clinics').get();
    console.log(`📊 Всего клиник в базе: ${clinicCount.count}`);
    
  } catch (error) {
    console.error('❌ Ошибка при проверке структуры:', error);
  }
}

checkSQLiteStructure();

