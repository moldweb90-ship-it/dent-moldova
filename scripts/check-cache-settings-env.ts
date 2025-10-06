import { storage } from '../server/storage';

async function checkCacheSettingsEnvironment() {
  console.log('🔍 ПРОВЕРКА НАСТРОЕК КЕШИРОВАНИЯ ПО СРЕДАМ');
  console.log('==========================================\n');
  
  try {
    // Определяем текущую среду
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    const environment = isDevelopment ? 'DEVELOPMENT' : isProduction ? 'PRODUCTION' : 'UNKNOWN';
    
    console.log(`🌍 Текущая среда: ${environment}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'не установлен'}`);
    
    // Проверяем базу данных
    console.log('\n🗄️ Информация о базе данных:');
    const allSettings = await storage.getAllSiteSettings();
    console.log(`   Всего настроек в БД: ${allSettings.length}`);
    
    // Проверяем настройки кеша
    const cacheSettings = allSettings.filter(setting => 
      setting.key.includes('cache') || 
      setting.key.includes('static') || 
      setting.key.includes('api') || 
      setting.key.includes('pages')
    );
    
    console.log(`   Настроек кеша: ${cacheSettings.length}`);
    
    if (cacheSettings.length > 0) {
      console.log('\n📋 Настройки кеша в текущей БД:');
      cacheSettings.forEach(setting => {
        console.log(`   ${setting.key}: ${setting.value}`);
      });
    } else {
      console.log('\n❌ Настройки кеша НЕ НАЙДЕНЫ в текущей БД!');
      console.log('   Нужно запустить инициализацию.');
    }
    
    // Проверяем специфичные настройки
    console.log('\n🔧 Проверка ключевых настроек:');
    const keySettings = ['cacheEnabled', 'cacheStrategy', 'staticAssetsDuration', 'apiDataDuration'];
    
    for (const key of keySettings) {
      const setting = await storage.getSiteSetting(key);
      if (setting) {
        console.log(`   ✅ ${key}: ${setting.value}`);
      } else {
        console.log(`   ❌ ${key}: НЕ НАЙДЕН`);
      }
    }
    
    // Рекомендации
    console.log('\n💡 РЕКОМЕНДАЦИИ:');
    
    if (isDevelopment) {
      console.log('   🟢 DEVELOPMENT среда:');
      console.log('   - Настройки кеша записались в девелоперскую БД');
      console.log('   - При деплое на продакшен нужно инициализировать настройки');
      console.log('   - Запустите: npm run init:cache:prod');
    } else if (isProduction) {
      console.log('   🔴 PRODUCTION среда:');
      if (cacheSettings.length === 0) {
        console.log('   - Настройки кеша НЕ ИНИЦИАЛИЗИРОВАНЫ!');
        console.log('   - СРОЧНО запустите: npm run init:cache:prod');
      } else {
        console.log('   - Настройки кеша инициализированы ✅');
        console.log('   - Кеширование должно работать');
      }
    } else {
      console.log('   ⚠️  Неизвестная среда:');
      console.log('   - Проверьте переменную NODE_ENV');
    }
    
    console.log('\n📝 СЛЕДУЮЩИЕ ШАГИ:');
    console.log('   1. Для девелопмента: настройки уже есть');
    console.log('   2. Для продакшена: запустите init-cache-settings-production.ts');
    console.log('   3. Проверьте работу кеширования на мобильных устройствах');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке настроек:', error);
  }
}

checkCacheSettingsEnvironment();
