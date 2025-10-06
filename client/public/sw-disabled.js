// Полностью отключенный Service Worker
console.log('Disabled Service Worker loaded');

self.addEventListener('install', () => {
  console.log('Disabled Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Disabled Service Worker activated');
  self.clients.claim();
});

// Никакого кеширования - просто пропускаем все запросы
self.addEventListener('fetch', (event) => {
  // Просто пропускаем все запросы без кеширования
  return;
});