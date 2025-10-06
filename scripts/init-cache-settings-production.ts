import { storage } from '../server/storage';

async function initCacheSettingsProduction() {
  console.log('🚀 ИНИЦИАЛИЗАЦИЯ НАСТРОЕК КЕШИРОВАНИЯ ДЛЯ ПРОДАКШЕНА');
  console.log('====================================================\n');
  
  try {
    // Проверяем текущую базу данных
    console.log('📊 Проверяем текущую базу данных...');
    const allSettings = await storage.getAllSiteSettings();
    console.log(`   Всего настроек в БД: ${allSettings.length}`);
    
    // Проверяем есть ли уже настройки кеша
    const existingCacheSettings = allSettings.filter(setting => 
      setting.key.includes('cache') || 
      setting.key.includes('static') || 
      setting.key.includes('api') || 
      setting.key.includes('pages')
    );
    
    console.log(`   Настроек кеша уже есть: ${existingCacheSettings.length}`);
    
    if (existingCacheSettings.length > 0) {
      console.log('\n📋 Существующие настройки кеша:');
      existingCacheSettings.forEach(setting => {
        console.log(`   ${setting.key}: ${setting.value}`);
      });
      
      console.log('\n❓ Настройки кеша уже существуют!');
      console.log('   Хотите их перезаписать? (y/N)');
      
      // В продакшене всегда перезаписываем
      console.log('   Автоматически перезаписываем для продакшена...');
    }
    
    // Настройки кеша по умолчанию для продакшена
    const productionCacheSettings = {
      cacheEnabled: 'true',
      cacheStrategy: 'staleWhileRevalidate',
      staticAssetsEnabled: 'true',
      staticAssetsDuration: '30', // 30 дней для статических файлов
      staticAssetsMaxSize: '100', // 100 MB максимум
      apiDataEnabled: 'true',
      apiDataDuration: '15', // 15 минут для API данных
      apiEndpoints: 'clinics,cities,districts,services',
      pagesEnabled: 'true',
      pagesDuration: '2', // 2 часа для страниц
      pagesPreload: 'true'
    };
    
    console.log('\n🔧 Инициализируем настройки кеша для продакшена...');
    
    for (const [key, value] of Object.entries(productionCacheSettings)) {
      await storage.setSiteSetting(key, value);
      console.log(`   ✅ ${key}: ${value}`);
    }
    
    console.log('\n🎉 Настройки кеширования для продакшена инициализированы!');
    
    // Проверяем что настройки сохранились
    console.log('\n🔍 Проверяем сохраненные настройки...');
    const updatedSettings = await storage.getAllSiteSettings();
    const updatedCacheSettings = updatedSettings.filter(setting => 
      setting.key.includes('cache') || 
      setting.key.includes('static') || 
      setting.key.includes('api') || 
      setting.key.includes('pages')
    );
    
    console.log(`   Настроек кеша после инициализации: ${updatedCacheSettings.length}`);
    
    console.log('\n📋 Финальные настройки кеша:');
    updatedCacheSettings.forEach(setting => {
      console.log(`   ${setting.key}: ${setting.value}`);
    });
    
    console.log('\n✅ ГОТОВО! Настройки кеширования готовы для продакшена.');
    console.log('\n📝 Следующие шаги:');
    console.log('   1. Деплой на продакшен сервер');
    console.log('   2. Запуск этого скрипта на продакшене');
    console.log('   3. Проверка работы кеширования');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации настроек кеша:', error);
    process.exit(1);
  }
}

initCacheSettingsProduction();
