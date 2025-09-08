import Database from 'better-sqlite3';

const sqlite = new Database('dev.db');

console.log('=== CHECKING REVIEWS ===');

// Проверяем структуру таблицы
const columns = sqlite.prepare("PRAGMA table_info(reviews)").all();
console.log('Table structure:');
columns.forEach(col => console.log(`  ${col.name}: ${col.type}`));

// Проверяем количество отзывов
const count = sqlite.prepare('SELECT COUNT(*) as count FROM reviews').get();
console.log(`\nTotal reviews: ${count.count}`);

// Получаем все отзывы
const reviews = sqlite.prepare('SELECT * FROM reviews').all();
console.log('\nReviews:');
reviews.forEach((review, i) => {
  console.log(`${i+1}. ID: ${review.id}`);
  console.log(`   Clinic: ${review.clinic_id}`);
  console.log(`   Rating: ${review.average_rating}`);
  console.log(`   Status: ${review.status}`);
  console.log(`   Comment: ${review.comment}`);
  console.log('');
});

// Проверяем клиники
const clinics = sqlite.prepare('SELECT id, name_ru FROM clinics LIMIT 3').all();
console.log('Available clinics:');
clinics.forEach(clinic => {
  console.log(`  ${clinic.id}: ${clinic.name_ru}`);
});

sqlite.close();
