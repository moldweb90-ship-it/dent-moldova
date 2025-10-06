// Service Worker включен для кеширования
console.log('Service Worker включен для кеширования');

self.addEventListener('install', () => {
  console.log('Service Worker установлен');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker активирован');
  self.clients.claim();
});

// Обрабатываем fetch события для кеширования
self.addEventListener('fetch', (event) => {
  // Кешируем статические ресурсы
  if (event.request.destination === 'image' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open('static-cache').then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});