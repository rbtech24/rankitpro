// Service Worker for offline capabilities
const CACHE_NAME = 'rank-it-pro-mobile-v1';
const OFFLINE_CACHE_NAME = 'rank-it-pro-offline-v1';

// URLs to cache for offline use
const urlsToCache = [
  '/',
  '/tech-app',
  '/mobile',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-visits') {
    event.waitUntil(syncOfflineVisits());
  }
});

// Sync offline visits when connection is restored
async function syncOfflineVisits() {
  try {
    const db = await openDB();
    const tx = db.transaction(['offline-visits'], 'readonly');
    const store = tx.objectStore('offline-visits');
    const visits = await store.getAll();
    
    for (const visit of visits) {
      try {
        const response = await fetch('/api/mobile/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visit.data),
        });
        
        if (response.ok) {
          // Remove from offline storage
          const deleteTx = db.transaction(['offline-visits'], 'readwrite');
          const deleteStore = deleteTx.objectStore('offline-visits');
          await deleteStore.delete(visit.id);
        }
      } catch (error) {
        console.error('Failed to sync visit:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Open IndexedDB for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rank-it-pro-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline-visits')) {
        db.createObjectStore('offline-visits', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}