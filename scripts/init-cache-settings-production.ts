import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { siteSettings } from '../shared/schema';

// Инициализация настроек кеширования для продакшена
async function initCacheSettingsProduction() {
  console.log('🚀 Инициализация настроек кеширования для продакшена...');
  
  // Используем PostgreSQL для продакшена
  const { DATABASE_URL } = process.env;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL не найден в переменных окружения');
    process.exit(1);
  }

  try {
    // Импортируем PostgreSQL драйвер
    const { drizzle: drizzlePg } = await import('drizzle-orm/postgres-js');
    const postgres = await import('postgres');
    
    const sql = postgres.default(DATABASE_URL);
    const db = drizzlePg(sql);

    // Настройки кеширования по умолчанию для продакшена
    const defaultCacheSettings = {
      cacheEnabled: true, // Включено для производительности
      cacheStrategy: 'networkFirst', // Network First для страниц (нет сброса форм)
      staticAssetsEnabled: true,
      staticAssetsDuration: 30, // 30 дней
      staticAssetsMaxSize: 100, // 100 MB
      apiDataEnabled: true,
      apiDataDuration: 15, // 15 минут
      apiEndpoints: 'clinics,cities,districts,services',
      pagesEnabled: false, // ОТКЛЮЧЕНО кеширование страниц (нет сброса форм)
      pagesDuration: 1, // 1 минута (не используется)
      pagesPreload: false, // ОТКЛЮЧЕНО предзагрузка
    };

    console.log('📝 Настройки кеширования по умолчанию:', defaultCacheSettings);

    // Сохраняем каждую настройку отдельно
    for (const [key, value] of Object.entries(defaultCacheSettings)) {
      try {
        await db.insert(siteSettings).values({
          key,
          value: JSON.stringify(value),
        }).onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value: JSON.stringify(value),
            updatedAt: new Date(),
          },
        });
        
        console.log(`✅ Настройка ${key} = ${JSON.stringify(value)} сохранена`);
      } catch (error) {
        console.error(`❌ Ошибка сохранения настройки ${key}:`, error);
      }
    }

    console.log('🎉 Настройки кеширования для продакшена инициализированы!');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации настроек кеширования:', error);
    process.exit(1);
  }
}

// Запускаем инициализацию
initCacheSettingsProduction().then(() => {
  console.log('✅ Инициализация завершена');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});