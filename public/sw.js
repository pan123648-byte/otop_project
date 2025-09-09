const CACHE_NAME = 'kalasin-tourism-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/admin.html'
  // เพิ่มไฟล์ HTML อื่นๆ ที่คุณมีที่นี่
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});