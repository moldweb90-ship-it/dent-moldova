// Service Worker для кеширования
const CACHE_NAME = 'clinici-md-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';
const PAGES_CACHE = 'pages-v1';

// Статистика кеша
let cacheStats = {
  totalFiles: 0,
  totalSize: 0,
  hitCount: 0,
  missCount: 0,
  lastUpdated: Date.now()
};

// Настройки кеширования (будут загружаться с сервера)
let cacheSettings = {
  cacheEnabled: true,
  cacheStrategy: 'staleWhileRevalidate',
  staticAssetsEnabled: true,
  staticAssetsDuration: 30, // дни
  staticAssetsMaxSize: 100, // MB
  apiDataEnabled: true,
  apiDataDuration: 15, // минуты
  apiEndpoints: ['clinics', 'cities', 'districts', 'services'],
  pagesEnabled: true,
  pagesDuration: 2, // часы
  pagesPreload: true
};

// Загрузка настроек кеширования
async function loadCacheSettings() {
  try {
    const response = await fetch('/api/admin/cache/settings');
    if (response.ok) {
      const settings = await response.json();
      cacheSettings = { ...cacheSettings, ...settings };
      console.log('Service Worker: Настройки кеша обновлены', cacheSettings);
    }
  } catch (error) {
    console.log('Не удалось загрузить настройки кеширования, используются по умолчанию');
  }
}

// Периодическое обновление настроек каждые 30 секунд
setInterval(loadCacheSettings, 30000);

// Обработка сообщений от админки
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_SETTINGS') {
    console.log('Service Worker: Получены новые настройки', event.data.settings);
    cacheSettings = { ...cacheSettings, ...event.data.settings };
    
    // Очищаем кеш при изменении настроек
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Очистка кеша', cacheName);
          return caches.delete(cacheName);
        })
      );
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка');
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация');
  event.waitUntil(
    Promise.all([
      loadCacheSettings(),
      self.clients.claim(),
      // Очистка старых кешей
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== PAGES_CACHE) {
              console.log('Service Worker: Удаление старого кеша', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  if (!cacheSettings.cacheEnabled) {
    return; // Кеширование отключено
  }

  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем запросы к админке и API управления
  if (url.pathname.startsWith('/admin') || 
      url.pathname.startsWith('/api/admin')) {
    return;
  }

  // Статические ресурсы (JS, CSS, изображения)
  if (isStaticAsset(request)) {
    if (cacheSettings.staticAssetsEnabled) {
      event.respondWith(handleStaticAsset(request));
    }
    return;
  }

  // API запросы
  if (url.pathname.startsWith('/api/')) {
    if (cacheSettings.apiDataEnabled && 
        isCacheableApiEndpoint(url.pathname)) {
      event.respondWith(handleApiRequest(request));
    }
    return;
  }

  // HTML страницы
  if (request.destination === 'document') {
    if (cacheSettings.pagesEnabled) {
      event.respondWith(handlePageRequest(request));
    }
    return;
  }
});

// Проверка статических ресурсов
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.ico'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'image' ||
         request.destination === 'font';
}

// Проверка кешируемых API эндпоинтов
function isCacheableApiEndpoint(pathname) {
  return cacheSettings.apiEndpoints.some(endpoint => 
    pathname.includes(`/api/${endpoint}`)
  );
}

// Обработка статических ресурсов
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Проверяем возраст кеша
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date'));
    const maxAge = cacheSettings.staticAssetsDuration * 24 * 60 * 60 * 1000; // дни в мс
    
    if (Date.now() - cacheDate.getTime() < maxAge) {
      cacheStats.hitCount++;
      return cachedResponse;
    }
  }
  
  cacheStats.missCount++;

  // Загружаем из сети
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Клонируем ответ и добавляем метаданные
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });

      await cache.put(request, modifiedResponse);
      // Собираем статистику после кеширования
      setTimeout(() => collectCacheStats(), 100);
      return networkResponse;
    }
  } catch (error) {
    console.log('Ошибка загрузки статического ресурса:', error);
  }

  return cachedResponse || new Response('Ресурс недоступен', { status: 404 });
}

// Обработка API запросов
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Проверяем возраст кеша
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date'));
    const maxAge = cacheSettings.apiDataDuration * 60 * 1000; // минуты в мс
    
    if (Date.now() - cacheDate.getTime() < maxAge) {
      cacheStats.hitCount++;
      // Обновляем в фоне если используется staleWhileRevalidate
      if (cacheSettings.cacheStrategy === 'staleWhileRevalidate') {
        fetch(request).then(response => {
          if (response.ok) {
            const responseToCache = response.clone();
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cache-date', new Date().toISOString());
            
            const modifiedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers
            });
            
            cache.put(request, modifiedResponse);
          }
        }).catch(() => {});
      }
      return cachedResponse;
    }
  }
  
  cacheStats.missCount++;

  // Загружаем из сети
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Клонируем ответ и добавляем метаданные
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });

      await cache.put(request, modifiedResponse);
      return networkResponse;
    }
  } catch (error) {
    console.log('Ошибка загрузки API:', error);
  }

  return cachedResponse || new Response('Данные недоступны', { status: 503 });
}

// Обработка HTML страниц
async function handlePageRequest(request) {
  // Если кеширование страниц отключено - всегда идем в сеть
  if (!cacheSettings.pagesEnabled) {
    cacheStats.missCount++;
    return fetch(request);
  }

  const cache = await caches.open(PAGES_CACHE);
  const cachedResponse = await cache.match(request);

  // Network First стратегия для страниц (рекомендуется)
  if (cacheSettings.cacheStrategy === 'networkFirst') {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cache-date', new Date().toISOString());
        
        const modifiedResponse = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: headers
        });
        
        await cache.put(request, modifiedResponse);
        cacheStats.missCount++;
        return networkResponse;
      }
    } catch (error) {
      console.log('Network error, trying cache:', error);
    }
    
    // Если сеть недоступна - используем кеш
    if (cachedResponse) {
      cacheStats.hitCount++;
      return cachedResponse;
    }
  }

  // Cache First или Stale While Revalidate для страниц
  if (cachedResponse) {
    // Проверяем возраст кеша
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date'));
    const maxAge = cacheSettings.pagesDuration * 60 * 60 * 1000; // часы в мс
    
    if (Date.now() - cacheDate.getTime() < maxAge) {
      cacheStats.hitCount++;
      // Обновляем в фоне если используется staleWhileRevalidate
      if (cacheSettings.cacheStrategy === 'staleWhileRevalidate') {
        fetch(request).then(response => {
          if (response.ok) {
            const responseToCache = response.clone();
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cache-date', new Date().toISOString());
            
            const modifiedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers
            });
            
            cache.put(request, modifiedResponse);
          }
        }).catch(() => {});
      }
      return cachedResponse;
    }
  }
  
  cacheStats.missCount++;

  // Загружаем из сети
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Клонируем ответ и добавляем метаданные
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });

      await cache.put(request, modifiedResponse);
      return networkResponse;
    }
  } catch (error) {
    console.log('Ошибка загрузки страницы:', error);
  }

  return cachedResponse || new Response('Страница недоступна', { status: 503 });
}

// Сбор статистики кеша
async function collectCacheStats() {
  try {
    const cacheNames = await caches.keys();
    let totalFiles = 0;
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      totalFiles += keys.length;
      
      // Подсчитываем размер (приблизительно)
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    cacheStats.totalFiles = totalFiles;
    cacheStats.totalSize = totalSize;
    cacheStats.lastUpdated = Date.now();
    
    // Отправляем статистику на сервер
    await sendStatsToServer();
    
    return cacheStats;
  } catch (error) {
    console.error('Ошибка сбора статистики кеша:', error);
    return cacheStats;
  }
}

// Отправка статистики на сервер
async function sendStatsToServer() {
  try {
    await fetch('/api/admin/cache/stats/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...cacheStats,
        hitRate: cacheStats.hitCount + cacheStats.missCount > 0 
          ? Math.round((cacheStats.hitCount / (cacheStats.hitCount + cacheStats.missCount)) * 100) 
          : 0
      })
    });
  } catch (error) {
    console.log('Не удалось отправить статистику на сервер:', error);
  }
}

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
  
  if (event.data && event.data.type === 'UPDATE_SETTINGS') {
    cacheSettings = { ...cacheSettings, ...event.data.settings };
    console.log('Service Worker: Настройки кеширования обновлены', cacheSettings);
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    event.waitUntil(
      collectCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      })
    );
  }
});

// Очистка всех кешей
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('Service Worker: Все кеши очищены');
}

// Предзагрузка популярных страниц
async function preloadPopularPages() {
  if (!cacheSettings.pagesPreload) return;
  
  const popularPages = [
    '/',
    '/ro',
    '/pricing',
    '/ro/pricing'
  ];
  
  const cache = await caches.open(PAGES_CACHE);
  
  for (const page of popularPages) {
    try {
      const response = await fetch(page);
      if (response.ok) {
        const responseToCache = response.clone();
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cache-date', new Date().toISOString());
        
        const modifiedResponse = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: headers
        });
        
        await cache.put(page, modifiedResponse);
        console.log('Service Worker: Предзагружена страница', page);
      }
    } catch (error) {
      console.log('Service Worker: Ошибка предзагрузки', page, error);
    }
  }
}

// Запуск предзагрузки после активации
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      loadCacheSettings(),
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== PAGES_CACHE) {
              console.log('Service Worker: Удаление старого кеша', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      preloadPopularPages()
    ])
  );
});
