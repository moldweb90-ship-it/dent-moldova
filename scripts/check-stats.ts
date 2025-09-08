import { db } from '../server/db';
import { analyticsEvents, clinics } from '../shared/schema';
import { gte, eq, and, inArray, desc } from 'drizzle-orm';

async function checkStats() {
  try {
    console.log('📊 Проверяем статистику для админки...');
    
    // Получаем события за последние 7 дней
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const events = await db
      .select({
        clinicId: analyticsEvents.clinicId,
        eventType: analyticsEvents.eventType,
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, startDate));

    console.log(`Всего событий за 7 дней: ${events.length}`);
    
    // Получаем клиники
    const clinicIds = [...new Set(events.map(e => e.clinicId).filter(Boolean))];
    const clinicsData = clinicIds.length > 0 
      ? await db.select({ id: clinics.id, name: clinics.name }).from(clinics).where(inArray(clinics.id, clinicIds))
      : [];

    // Обрабатываем события как в storage.ts
    const clinicStats = new Map<string, {
      id: string;
      name: string;
      clicks: { book: number; phone: number; website: number };
      totalClicks: number;
    }>();

    // Инициализируем статистику клиник
    clinicsData.forEach(clinic => {
      clinicStats.set(clinic.id, {
        id: clinic.id,
        name: clinic.name,
        clicks: { book: 0, phone: 0, website: 0 },
        totalClicks: 0,
      });
    });

    // Подсчитываем события
    events.forEach(event => {
      if (!event.clinicId) return;
      
      const stats = clinicStats.get(event.clinicId);
      if (!stats) return;

      if (event.eventType === 'view') {
        // Игнорируем просмотры в статистике
      } else if (event.eventType === 'click_details') {
        // Игнорируем click_details в статистике полностью
        // Не добавляем в totalClicks
      } else if (event.eventType === 'click_book') {
        stats.clicks.book++;
        stats.totalClicks++;
      } else if (event.eventType === 'click_phone') {
        stats.clicks.phone++;
        stats.totalClicks++;
      } else if (event.eventType === 'click_website') {
        stats.clicks.website++;
        stats.totalClicks++;
      }
    });

    // Общая статистика
    const overallStats = {
      totalClicks: 0,
      totalClinics: clinicStats.size,
      topClinic: null as any,
    };

    let maxClicks = 0;
    clinicStats.forEach(stats => {
      overallStats.totalClicks += stats.totalClicks;
      
      if (stats.totalClicks > maxClicks) {
        maxClicks = stats.totalClicks;
        overallStats.topClinic = stats;
      }
    });

    console.log('\n📈 Общая статистика:');
    console.log(`- Всего кликов: ${overallStats.totalClicks}`);
    console.log(`- Клиники: ${overallStats.totalClinics}`);
    console.log(`- Активные клиники: ${Array.from(clinicStats.values()).filter(clinic => clinic.totalClicks > 0).length}`);

    console.log('\n📋 Статистика по клиникам:');
    const sortedClinics = Array.from(clinicStats.values()).sort((a, b) => b.totalClicks - a.totalClicks);
    
         sortedClinics.forEach(clinic => {
       console.log(`\n🏥 ${clinic.name}:`);
       console.log(`  - Всего кликов: ${clinic.totalClicks}`);
       console.log(`  - Записаться: ${clinic.clicks.book}`);
       console.log(`  - Позвонить: ${clinic.clicks.phone}`);
       console.log(`  - Сайт: ${clinic.clicks.website}`);
     });
    
  } catch (error) {
    console.error('❌ Ошибка при проверке статистики:', error);
  } finally {
    process.exit(0);
  }
}

checkStats();
