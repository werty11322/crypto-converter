const CACHE_NAME = 'crypto-converter-v1';
const urlsToCache = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Установка сервис-воркера
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация сервис-воркера
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кэш, если есть
        if (response) {
          return response;
        }
        
        // Иначе — делаем сетевой запрос
        return fetch(event.request)
          .then(response => {
            // Кэшируем успешные ответы
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Если нет интернета — возвращаем кэш
            return caches.match('index.html');
          });
      })
  );
});

// Сообщение о готовности к оффлайн-работе
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
