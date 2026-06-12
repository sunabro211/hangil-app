const CACHE_NAME = 'hangil-v2';  // ⚠️ 업데이트 시 v3, v4 등으로 올려야 함
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache base files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - questions.json: network-first (always try fresh, fallback to cache)
// - everything else: cache-first
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Network-first for questions.json (so updates are picked up fast)
  if (url.includes('questions.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh copy
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});