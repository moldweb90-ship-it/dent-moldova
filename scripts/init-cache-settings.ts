import { storage } from '../server/storage';

async function initCacheSettings() {
  console.log('🔧 Инициализация настроек кеширования...');
  
  const defaultCacheSettings = {
    cacheEnabled: 'true',
    cacheStrategy: 'staleWhileRevalidate',
    staticAssetsEnabled: 'true',
    staticAssetsDuration: '30',
    staticAssetsMaxSize: '100',
    apiDataEnabled: 'true',
    apiDataDuration: '15',
    apiEndpoints: 'clinics,cities,districts,services',
    pagesEnabled: 'true',
    pagesDuration: '2',
    pagesPreload: 'true'
  };

  try {
    for (const [key, value] of Object.entries(defaultCacheSettings)) {
      await storage.setSiteSetting(key, value);
      console.log(`✅ ${key}: ${value}`);
    }
    
    console.log('🎉 Настройки кеширования инициализированы!');
  } catch (error) {
    console.error('❌ Ошибка инициализации настроек кеширования:', error);
  }
}

initCacheSettings();
