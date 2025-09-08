import { db } from '../server/db';
import { analyticsEvents, siteViews } from '../shared/schema';

async function checkStats() {
  console.log('=== Проверка статистики ===');
  
  // Проверяем количество записей в analytics_events
  const analyticsCount = await db.select().from(analyticsEvents);
  console.log(`Записей в analytics_events: ${analyticsCount.length}`);
  
  // Проверяем количество записей в site_views
  const viewsCount = await db.select().from(siteViews);
  console.log(`Записей в site_views: ${viewsCount.length}`);
  
  if (analyticsCount.length > 0) {
    console.log('\nПервые 5 записей analytics_events:');
    analyticsCount.slice(0, 5).forEach((event, i) => {
      console.log(`${i + 1}. ${event.eventType} - ${event.clinicId} - ${event.createdAt}`);
    });
  }
  
  if (viewsCount.length > 0) {
    console.log('\nПервые 5 записей site_views:');
    viewsCount.slice(0, 5).forEach((view, i) => {
      console.log(`${i + 1}. ${view.ipAddress} - ${view.route} - ${view.createdAt}`);
    });
  }
}

async function clearStats() {
  console.log('\n=== Очистка статистики ===');
  
  // Очищаем analytics_events
  const analyticsResult = await db.delete(analyticsEvents);
  console.log('Результат очистки analytics_events:', analyticsResult);
  
  // Очищаем site_views
  const viewsResult = await db.delete(siteViews);
  console.log('Результат очистки site_views:', viewsResult);
  
  console.log('Очистка завершена');
}

async function main() {
  try {
    await checkStats();
    await clearStats();
    console.log('\n=== Проверка после очистки ===');
    await checkStats();
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    process.exit(0);
  }
}

main();
