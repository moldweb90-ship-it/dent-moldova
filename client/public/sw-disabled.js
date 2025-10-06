// Отключенный Service Worker - не выполняет кеширование
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

// Никакого кеширования - просто пропускаем все запросы
self.addEventListener('fetch', (event) => {
  // Просто пропускаем все запросы без кеширования
});