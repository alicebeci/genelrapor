const CACHE_NAME = 'analiz-v1';
const urlsToCache = [
  '/analiz/',
  '/analiz/index.html'
];

// Install event - cache dosyaları
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Cache hatası:', err);
      })
  );
  self.skipWaiting();
});

// Fetch event - cache'den veya network'ten getir
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache'de varsa cache'den getir
        if (response) {
          return response;
        }
        // Yoksa network'ten getir ve cache'e ekle
        return fetch(event.request)
          .then((networkResponse) => {
            // Sadece GET isteklerini cache'e ekle
            if (event.request.method === 'GET' && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline ve cache'de yoksa
            console.log('Offline ve cache bulunamadı');
          });
      })
  );
});

// Activate event - eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});