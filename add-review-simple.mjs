import Database from 'better-sqlite3';

const sqlite = new Database('dev.db');

// Получаем первую клинику
const clinic = sqlite.prepare('SELECT id, name_ru FROM clinics LIMIT 1').get();
console.log('Clinic:', clinic);

if (clinic) {
  // Добавляем отзыв
  const reviewId = 'review-' + Date.now();
  const now = new Date().toISOString();
  
  sqlite.prepare(`
    INSERT INTO reviews (
      id, clinic_id, author_name, quality_rating, service_rating, 
      comfort_rating, price_rating, average_rating, comment, status, 
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    reviewId, clinic.id, 'Test User', 4.5, 4.0, 3.5, 4.0, 4.0, 
    'Тестовый отзыв', 'pending', now, now
  );
  
  console.log('Review added:', reviewId);
}

// Проверяем отзывы
const reviews = sqlite.prepare('SELECT * FROM reviews').all();
console.log('Reviews count:', reviews.length);
console.log('Reviews:', reviews);

sqlite.close();
