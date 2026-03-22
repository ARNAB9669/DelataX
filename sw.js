const CACHE_NAME = 'deltax-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/index.js',
  '/icons/icon-192.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch Assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});