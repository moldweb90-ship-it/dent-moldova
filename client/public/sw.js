// Service Worker - самоуничтожение и очистка всего кэша

self.addEventListener('install', function(event) {
  console.log('SW: Установка версии очистки');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('SW: Активация - очистка всех кэшей');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('SW: Удаление кэша', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('SW: Все кэши очищены, отменяю регистрацию');
      return self.registration.unregister();
    }).then(function() {
      console.log('SW: Регистрация отменена, перезагружаю клиентов');
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(client => client.navigate(client.url));
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Не кэшируем ничего, пропускаем всё в сеть
  event.respondWith(fetch(event.request));
});
