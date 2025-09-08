import { db } from '../server/db';
import { analyticsEvents } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function testAnalytics() {
  try {
    console.log('🧪 Тестируем аналитику...');
    
    // Добавляем тестовые события для клиники
    const testEvents = [
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', eventType: 'view', ipAddress: '127.0.0.1', userAgent: 'Test Script', referrer: 'test' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', eventType: 'view', ipAddress: '127.0.0.1', userAgent: 'Test Script', referrer: 'test' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', eventType: 'click_details', ipAddress: '127.0.0.1', userAgent: 'Test Script', referrer: 'test' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', eventType: 'click_book', ipAddress: '127.0.0.1', userAgent: 'Test Script', referrer: 'test' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', eventType: 'click_phone', ipAddress: '127.0.0.1', userAgent: 'Test Script', referrer: 'test' },
      { clinicId: '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3', eventType: 'click_website', ipAddress: '127.0.0.1', userAgent: 'Test Script', referrer: 'test' },
    ];

    for (const event of testEvents) {
      await db.insert(analyticsEvents).values(event);
      console.log(`✅ Добавлено событие: ${event.eventType}`);
    }

    console.log('\n📊 Проверяем статистику...');
    
    // Получаем все события для клиники
    const allEvents = await db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.clinicId, '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3'));

    console.log(`Всего событий для клиники: ${allEvents.length}`);
    
    const views = allEvents.filter(e => e.eventType === 'view').length;
    const clickDetails = allEvents.filter(e => e.eventType === 'click_details').length;
    const clickBook = allEvents.filter(e => e.eventType === 'click_book').length;
    const clickPhone = allEvents.filter(e => e.eventType === 'click_phone').length;
    const clickWebsite = allEvents.filter(e => e.eventType === 'click_website').length;
    
    const totalClicks = clickBook + clickPhone + clickWebsite; // Без click_details
    
    console.log(`📈 Статистика:`);
    console.log(`- Просмотры: ${views}`);
    console.log(`- Клики "Подробнее": ${clickDetails}`);
    console.log(`- Клики "Записаться": ${clickBook}`);
    console.log(`- Клики "Позвонить": ${clickPhone}`);
    console.log(`- Клики "Сайт": ${clickWebsite}`);
    console.log(`- Всего кликов (без "Подробнее"): ${totalClicks}`);
    console.log(`- Конверсия: ${views > 0 ? ((totalClicks / views) * 100).toFixed(1) : '0'}%`);
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании аналитики:', error);
  } finally {
    process.exit(0);
  }
}

testAnalytics();
