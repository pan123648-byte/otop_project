const CACHE_NAME = 'kalasin-tourism-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css', // หากคุณมีไฟล์ css แยก
  '/app.js',     // หากคุณมีไฟล์ js แยก
  '/icons/icon-192x192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});