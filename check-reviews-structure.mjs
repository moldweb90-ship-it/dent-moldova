import Database from 'better-sqlite3';

async function checkReviewsStructure() {
  try {
    console.log('🔍 Проверяем структуру таблицы reviews...');
    
    const sqlite = new Database('dev.db');
    
    // Проверяем структуру таблицы reviews
    const reviewColumns = sqlite.prepare("PRAGMA table_info(reviews)").all();
    console.log('📋 Структура таблицы reviews:');
    reviewColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    // Проверяем количество отзывов
    const reviewCount = sqlite.prepare('SELECT COUNT(*) as count FROM reviews').get();
    console.log(`📊 Всего отзывов в базе: ${reviewCount.count}`);
    
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Ошибка при проверке структуры:', error);
  }
}

checkReviewsStructure();
