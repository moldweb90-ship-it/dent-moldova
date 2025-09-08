import Database from 'better-sqlite3';

async function addTestReview() {
  try {
    console.log('🔍 Добавляем тестовый отзыв...');
    
    const sqlite = new Database('dev.db');
    
    // Получаем первую клинику
    const clinic = sqlite.prepare('SELECT id, name_ru FROM clinics LIMIT 1').get();
    
    if (!clinic) {
      console.log('❌ Клиники не найдены');
      sqlite.close();
      return;
    }
    
    console.log(`📋 Найдена клиника: ${clinic.name_ru} (ID: ${clinic.id})`);
    
    // Создаем тестовый отзыв
    const reviewId = 'test-review-' + Date.now();
    const now = new Date().toISOString();
    
    const insertQuery = `
      INSERT INTO reviews (
        id, clinic_id, author_name, author_email, quality_rating, 
        service_rating, comfort_rating, price_rating, average_rating, 
        comment, status, ip_address, user_agent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    sqlite.prepare(insertQuery).run(
      reviewId,
      clinic.id,
      'Test User',
      'test@example.com',
      4.5,
      4.0,
      3.5,
      4.0,
      4.0,
      'Тестовый отзыв для проверки API',
      'pending',
      '127.0.0.1',
      'Test Script',
      now,
      now
    );
    
    console.log('✅ Тестовый отзыв добавлен!');
    
    // Проверяем количество отзывов
    const count = sqlite.prepare('SELECT COUNT(*) as count FROM reviews').get();
    console.log(`📊 Всего отзывов в базе: ${count.count}`);
    
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении отзыва:', error);
  }
}

addTestReview();
