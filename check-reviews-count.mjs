import Database from 'better-sqlite3';

async function checkReviewsCount() {
  try {
    console.log('🔍 Проверяем количество отзывов...');
    
    const sqlite = new Database('dev.db');
    
    // Проверяем количество отзывов
    const reviewCount = sqlite.prepare('SELECT COUNT(*) as count FROM reviews').get();
    console.log(`📊 Всего отзывов в базе: ${reviewCount.count}`);
    
    // Получаем все отзывы
    const reviews = sqlite.prepare('SELECT * FROM reviews').all();
    console.log('📋 Отзывы:');
    reviews.forEach((review, index) => {
      console.log(`  ${index + 1}. ID: ${review.id}, Клиника: ${review.clinic_id}, Рейтинг: ${review.average_rating}, Статус: ${review.status}`);
    });
    
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Ошибка при проверке отзывов:', error);
  }
}

checkReviewsCount();
