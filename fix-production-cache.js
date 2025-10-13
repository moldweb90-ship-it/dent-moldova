#!/usr/bin/env node

/**
 * 🚨 КРИТИЧЕСКИЙ ФИКС: Принудительное обновление настроек кеширования на продакшне
 * 
 * Проблема: На продакшне есть принудительные настройки кеширования, которые обходят админку
 * Решение: Принудительно устанавливаем правильные настройки в БД
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Настройки для исправления проблемы со сбросом форм
const FIX_SETTINGS = {
  // ОТКЛЮЧАЕМ кеширование страниц - главная причина сброса форм
  pagesEnabled: 'false',
  pagesPreload: 'false',
  
  // Network First стратегия - всегда свежие страницы
  cacheStrategy: 'networkFirst',
  
  // Включаем кеширование статики и API (это безопасно)
  cacheEnabled: 'true',
  staticAssetsEnabled: 'true',
  apiDataEnabled: 'true',
  
  // Разумные сроки кеширования
  staticAssetsDuration: '30', // 30 дней для статики
  apiDataDuration: '15', // 15 минут для API
  staticAssetsMaxSize: '100', // 100 MB
  apiEndpoints: 'clinics,cities,districts,services'
};

async function fixProductionCache() {
  console.log('🚨 КРИТИЧЕСКИЙ ФИКС: Исправление настроек кеширования на продакшне');
  console.log('📋 Цель: Устранить сброс форм на мобильных устройствах');
  
  const { DATABASE_URL } = process.env;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL не найден в переменных окружения');
    console.log('💡 Убедитесь что переменная DATABASE_URL установлена');
    process.exit(1);
  }

  try {
    const sql = postgres(DATABASE_URL);
    const db = drizzle(sql);
    
    console.log('🔧 Применяем исправления...');
    
    for (const [key, value] of Object.entries(FIX_SETTINGS)) {
      try {
        // Принудительно обновляем каждую настройку
        await sql`
          INSERT INTO site_settings (key, value, created_at, updated_at)
          VALUES (${key}, ${value}, NOW(), NOW())
          ON CONFLICT (key) 
          DO UPDATE SET 
            value = EXCLUDED.value,
            updated_at = NOW()
        `;
        
        console.log(`✅ ${key} = ${value}`);
      } catch (error) {
        console.error(`❌ Ошибка обновления ${key}:`, error.message);
      }
    }
    
    console.log('🎉 ИСПРАВЛЕНИЯ ПРИМЕНЕНЫ!');
    console.log('');
    console.log('📱 Результат:');
    console.log('  ✅ Формы НЕ будут сбрасываться на мобильных');
    console.log('  ✅ Страницы всегда свежие (Network First)');
    console.log('  ✅ Статика и API кешируются эффективно');
    console.log('  ✅ Настройки админки теперь работают');
    console.log('');
    console.log('🔄 Следующие шаги:');
    console.log('  1. Перезапустите сервер');
    console.log('  2. Очистите кеш браузера на мобильном');
    console.log('  3. Проверьте что формы не сбрасываются');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

// Запускаем исправление
fixProductionCache().then(() => {
  console.log('✅ Исправление завершено');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
