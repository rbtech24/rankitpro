// Service Worker for Rank It Pro PWA
const CACHE_NAME = 'rankitpro-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install event - skip waiting for immediate activation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Cache addAll failed:', err);
          // Don't fail installation if caching fails
          return Promise.resolve();
        });
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Fetch event - avoid caching authentication requests
self.addEventListener('fetch', event => {
  // Skip caching for auth and API requests
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/logout') ||
      event.request.url.includes('/login')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If network fails, return a basic offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return new Response('Offline', { status: 200, statusText: 'OK' });
          }
        });
      })
  );
});

// Activate event - claim clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all([
        ...cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
        self.clients.claim()
      ]);
    })
  );
});