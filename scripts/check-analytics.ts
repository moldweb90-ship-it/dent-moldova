import { db } from '../server/db';
import { analyticsEvents } from '../shared/schema';

async function checkAnalytics() {
  try {
    console.log('🔍 Проверяем аналитику...');
    
    // Проверяем все события
    const allEvents = await db.select().from(analyticsEvents);
    console.log(`Всего событий в базе: ${allEvents.length}`);
    
    if (allEvents.length > 0) {
      console.log('\nПоследние 10 событий:');
      allEvents.slice(-10).forEach(event => {
        console.log(`- ${event.eventType} | Клиника: ${event.clinicId} | Время: ${event.createdAt}`);
      });
    }
    
    // Тестируем запись события
    console.log('\n🧪 Тестируем запись события...');
    await db.insert(analyticsEvents).values({
      clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3',
      eventType: 'view',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script',
      referrer: 'test'
    });
    console.log('✅ Тестовое событие записано');
    
    // Проверяем снова
    const updatedEvents = await db.select().from(analyticsEvents);
    console.log(`Теперь событий в базе: ${updatedEvents.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка при проверке аналитики:', error);
  } finally {
    process.exit(0);
  }
}

checkAnalytics();
