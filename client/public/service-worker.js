// Service Worker for GrowWise PWA
const CACHE_NAME = 'growwise-cache-v1';

// Assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Key static resources (these paths are relative to the deployed app)
  // The app will use esbuild to bundle resources, so we only cache main entry points
];

// Pages to pre-cache for better offline experience
const PRECACHE_PAGES = [
  '/dashboard',
  '/transactions'
];

// Install event - Cache static assets and offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache offline page
        fetch('/offline.html')
          .then(response => cache.put('/offline.html', response))
          .catch(error => console.error('Failed to cache offline page:', error));
        
        // Cache core static assets
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - Network-first strategy with offline fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extension URLs
  if (event.request.method !== 'GET' || event.request.url.includes('chrome-extension://')) {
    return;
  }

  // Skip API requests (we'll handle them differently)
  if (event.request.url.includes('/api/')) {
    return handleApiRequest(event);
  }

  // For everything else, use network-first with offline fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for future offline use
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            // If we have a cached version, return it
            if (cachedResponse) {
              return cachedResponse;
            }

            // For navigation requests (HTML pages), show the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }

            // If we can't serve from cache and it's not a navigation, return a simple error response
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle API requests specially - use network with background sync fallback for POST/PUT/DELETE
function handleApiRequest(event) {
  // For GET requests to API, we still attempt network first
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // For API data, just return empty with a status code indicating offline
          return new Response(JSON.stringify({ offline: true, message: 'You are offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  } 
  // For mutation requests, we'll register them for background sync if they fail
  else if (['POST', 'PUT', 'DELETE'].includes(event.request.method)) {
    // Only handle if background sync is supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      event.respondWith(
        fetch(event.request.clone())
          .catch((err) => {
            // Store for later sync and return a UI-friendly response
            return new Response(JSON.stringify({ 
              offline: true, 
              queued: true, 
              message: 'Your changes will be saved when you are back online'
            }), {
              status: 202, // Accepted but processing later
              headers: { 'Content-Type': 'application/json' }
            });
          })
      );
    }
  }
}

// Background sync - future enhancement
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    // This would be implemented for background sync of saved offline transactions
    event.waitUntil(syncTransactions());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification('GrowWise', {
        body: data.message || 'You have a new notification',
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2327AE60"%3E%3Cpath d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"%3E%3C/path%3E%3C/svg%3E',
        badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2327AE60"%3E%3Cpath d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"%3E%3C/path%3E%3C/svg%3E',
        data: data
      })
    );
  } catch (e) {
    console.error('Push notification error:', e);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Try to handle specific action based on the notification data
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    // Default to opening the app's home page
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Optional placeholder for background sync implementation
function syncTransactions() {
  // This would sync stored transactions when coming back online
  return Promise.resolve();
}
