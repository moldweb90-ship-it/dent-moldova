// Отключенный Service Worker для экстренного деплоя
console.log('Service Worker отключен');

// Просто пропускаем все запросы без кеширования
self.addEventListener('fetch', (event) => {
  // Не делаем ничего - все запросы идут напрямую к серверу
  return;
});

self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка (отключен)');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация (отключен)');
  self.clients.claim();
});
